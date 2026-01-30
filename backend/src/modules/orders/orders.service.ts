import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CommissionsService } from '../commissions/commissions.service';
import { ReferralsService } from '../referrals/referrals.service';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly commissionsService: CommissionsService,
    private readonly referralsService: ReferralsService,
  ) { }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create({
      productId: dto.productId,
      walletAddress: dto.walletAddress,
      tokenType: dto.tokenType,
      amount: dto.amount,
      txHash: dto.txHash ?? null,
      status: 'pending', // Default to pending, waiting for admin approval
    });
    const savedOrder = await this.repo.save(order);

    // Auto Commission Logic
    try {
      const referrer = await this.referralsService.getReferrer(dto.walletAddress);
      if (referrer) {
        // Default 5% commission
        const orderAmount = parseFloat(dto.amount);
        const commissionAmount = (orderAmount * 0.05).toFixed(6);

        await this.commissionsService.createCommission(
          referrer,
          dto.walletAddress,
          commissionAmount,
          dto.tokenType,
          savedOrder.id
        );
      }
    } catch (e) {
      console.error('Error creating commission:', e);
      // Do not fail order creation if commission fails
    }

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) {
      throw new Error('Order not found');
    }
    order.status = status;
    return this.repo.save(order);
  }
}

