import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create({
      productId: dto.productId,
      walletAddress: dto.walletAddress,
      tokenType: dto.tokenType,
      amount: dto.amount,
      txHash: dto.txHash ?? null,
      status: 'completed',
    });
    return this.repo.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }
}
