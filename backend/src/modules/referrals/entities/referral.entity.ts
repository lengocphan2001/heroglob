import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 42, name: 'referrer_wallet' })
  @Index()
  referrerWallet!: string;

  @Column({ type: 'varchar', length: 42, name: 'referred_wallet', unique: true })
  referredWallet!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
