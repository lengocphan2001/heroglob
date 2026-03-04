import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InvestmentsService } from '../investments/investments.service';

function generateHashId(): string {
  return randomBytes(12).toString('base64url');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly investmentsService: InvestmentsService,
  ) { }

  async findAll(category?: string): Promise<Product[]> {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.created_at', 'DESC');
    if (category && category !== 'all') {
      qb.andWhere('p.category = :category', { category });
    }
    const list = await qb.getMany();
    for (const p of list) {
      if (!p.hashId) await this.ensureHashId(p);
    }
    return list;
  }

  private async ensureHashId(product: Product): Promise<void> {
    if (product.hashId) return;
    product.hashId = generateHashId();
    await this.repo.save(product);
  }

  /** Resolve by numeric id (admin) or hashId (public). */
  async findOneBySlug(identifier: string): Promise<Product> {
    const byId = /^\d+$/.test(identifier);
    const product = byId
      ? await this.repo.findOne({ where: { id: parseInt(identifier, 10) } })
      : await this.repo.findOne({ where: { hashId: identifier } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.hashId) await this.ensureHashId(product);
    return product;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.hashId) await this.ensureHashId(product);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({
      hashId: generateHashId(),
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl,
      creatorAvatarUrl: dto.creatorAvatarUrl ?? null,
      creatorHandle: dto.creatorHandle,
      price: dto.price ?? null,
      priceUsdt: dto.priceUsdt ?? '0',
      priceHero: dto.priceHero ?? '0',
      priceVariant: dto.priceVariant ?? 'dark',
      category: dto.category ?? 'all',
      live: dto.live ?? false,
      stock: dto.stock ?? 0,
      dailyHeroReward: dto.dailyHeroReward ?? '0',
      maxHeroReward: dto.maxHeroReward ?? '0',
    });
    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      ...(dto.creatorAvatarUrl !== undefined && { creatorAvatarUrl: dto.creatorAvatarUrl }),
      ...(dto.creatorHandle !== undefined && { creatorHandle: dto.creatorHandle }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.priceUsdt !== undefined && { priceUsdt: dto.priceUsdt }),
      ...(dto.priceHero !== undefined && { priceHero: dto.priceHero }),
      ...(dto.priceVariant !== undefined && { priceVariant: dto.priceVariant }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.live !== undefined && { live: dto.live }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.dailyHeroReward !== undefined && { dailyHeroReward: dto.dailyHeroReward }),
      ...(dto.maxHeroReward !== undefined && { maxHeroReward: dto.maxHeroReward }),
    });
    const saved = await this.repo.save(product);
    // When Daily HERO Reward is updated, fix existing pending order payouts so they show the new amount (e.g. Order #15).
    if (dto.dailyHeroReward !== undefined) {
      const newDaily = Number(saved.dailyHeroReward) || 0;
      if (newDaily > 0) {
        this.investmentsService.updatePendingOrderPayoutAmountsForProduct(id, newDaily).catch((e) => {
          console.error('Error updating pending order payouts for product', id, e);
        });
      }
    }
    return saved;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
