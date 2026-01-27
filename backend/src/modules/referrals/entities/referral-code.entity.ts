import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('referral_codes')
export class ReferralCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 42, name: 'wallet_address', unique: true })
  walletAddress!: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  code!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
