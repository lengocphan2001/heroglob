import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const DEFAULT_CATEGORIES: { slug: string; name: string; sortOrder: number }[] = [
  { slug: 'digital-art', name: 'Digital Art', sortOrder: 1 },
  { slug: 'metaverse', name: 'Metaverse', sortOrder: 2 },
  { slug: 'collectibles', name: 'Collectibles', sortOrder: 3 },
];

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async onModuleInit() {
    for (const c of DEFAULT_CATEGORIES) {
      const exists = await this.repo.findOne({ where: { slug: c.slug } });
      if (!exists) {
        await this.repo.save(this.repo.create(c));
      }
    }
  }

  async findAll(): Promise<Category[]> {
    return this.repo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictException('Slug đã tồn tại');
    const category = this.repo.create({
      slug,
      name: dto.name.trim(),
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.repo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase().replace(/\s+/g, '-');
      const existing = await this.repo.findOne({ where: { slug } });
      if (existing && existing.id !== id) throw new ConflictException('Slug đã tồn tại');
      category.slug = slug;
    }
    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    return this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.remove(category);
  }
}
