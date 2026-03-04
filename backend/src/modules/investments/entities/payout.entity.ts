import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { Investment } from './investment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('payouts')
export class Payout {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id' })
    userId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'int', name: 'investment_id', nullable: true })
    investmentId!: number | null;

    @ManyToOne(() => Investment)
    @JoinColumn({ name: 'investment_id' })
    investment!: Investment | null;

    @Column({ type: 'int', name: 'order_id', nullable: true })
    orderId!: number | null;

    @Column({ type: 'varchar', length: 42, nullable: true, name: 'wallet_address' })
    walletAddress!: string | null;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    amount!: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'tx_hash' })
    txHash!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'investment_daily' })
    type!: string;

    /** When this payout should be paid (e.g. 00:00 AM). Processed by cron at configured time. */
    @Column({ type: 'timestamp', nullable: true, name: 'scheduled_at' })
    scheduledAt!: Date | null;

    /** pending = not yet paid; paid = credited to user; failed = processing failed */
    @Column({ type: 'varchar', length: 20, default: 'paid' })
    status!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
