import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

function generateHashId(): string {
  return randomBytes(12).toString('base64url');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

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
    });
    return this.repo.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
