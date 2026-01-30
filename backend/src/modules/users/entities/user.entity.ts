import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 42, unique: true, nullable: true })
  walletAddress!: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  heroBalance!: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0, name: 'usdt_balance' })
  usdtBalance!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash', nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true, name: 'referral_code' })
  referralCode!: string | null;

  @Column({ type: 'int', nullable: true, name: 'referred_by_id' })
  referredById!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  rank!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
