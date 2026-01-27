import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'product_id' })
  @Index()
  productId!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'varchar', length: 42, name: 'wallet_address' })
  @Index()
  walletAddress!: string;

  @Column({ type: 'varchar', length: 10, name: 'token_type' })
  tokenType!: string; // 'usdt' | 'hero'

  @Column({ type: 'varchar', length: 50 })
  amount!: string;

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'tx_hash' })
  txHash!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
