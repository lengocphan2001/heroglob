import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 24, name: 'hash_id', unique: true, nullable: true })
  hashId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 512 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'creator_avatar_url' })
  creatorAvatarUrl!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'creator_handle' })
  creatorHandle!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  price!: string | null;

  @Column({ type: 'varchar', length: 30, default: '0', name: 'price_usdt' })
  priceUsdt!: string;

  @Column({ type: 'varchar', length: 30, default: '0', name: 'price_hero' })
  priceHero!: string;

  @Column({ type: 'varchar', length: 20, default: 'dark', name: 'price_variant' })
  priceVariant!: string;

  @Column({ type: 'varchar', length: 50, default: 'all' })
  category!: string;

  @Column({ type: 'boolean', default: false })
  live!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
