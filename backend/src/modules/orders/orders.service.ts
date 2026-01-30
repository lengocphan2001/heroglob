import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CommissionsService } from '../commissions/commissions.service';
import { ReferralsService } from '../referrals/referrals.service';
import { NFTsService } from '../nfts/nfts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly commissionsService: CommissionsService,
    private readonly referralsService: ReferralsService,
    private readonly nftsService: NFTsService,
    private readonly usersService: UsersService,
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

    // Create NFT for the user
    try {
      const user = await this.usersService.findByWallet(dto.walletAddress);
      if (user && dto.productId) {
        await this.nftsService.createNFT(
          user.id,
          dto.walletAddress,
          dto.productId,
          savedOrder.id
        );
      }
    } catch (e) {
      console.error('Error creating NFT:', e);
      // Do not fail order creation if NFT creation fails
    }

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

  async getUserProducts(walletAddress: string) {
    if (!walletAddress) {
      return [];
    }

    const orders = await this.repo.find({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        // Show all orders regardless of status
      },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    // Group by product and count quantities
    const productMap = new Map<number, any>();

    for (const order of orders) {
      if (!order.product) continue;

      const productId = order.productId!;
      if (productMap.has(productId)) {
        const existing = productMap.get(productId);
        existing.quantity += 1;
        existing.totalSpent += Number(order.amount);
      } else {
        productMap.set(productId, {
          productId: order.product.id,
          hashId: order.product.hashId,
          title: order.product.title,
          description: order.product.description,
          imageUrl: order.product.imageUrl,
          creatorHandle: order.product.creatorHandle,
          creatorAvatarUrl: order.product.creatorAvatarUrl,
          quantity: 1,
          totalSpent: Number(order.amount),
          lastPurchased: order.createdAt,
        });
      }
    }

    return Array.from(productMap.values());
  }
}

