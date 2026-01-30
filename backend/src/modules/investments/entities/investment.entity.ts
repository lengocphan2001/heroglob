import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('investments')
export class Investment {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'user_id' })
    userId!: number;

    @Column({ type: 'decimal', precision: 20, scale: 2 })
    amount!: number;

    @Column({ default: 'active' })
    status!: string; // active, closed

    @Column({ type: 'decimal', precision: 5, scale: 2, name: 'daily_profit_percent' })
    dailyProfitPercent!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'last_payout_at' })
    lastPayoutAt!: Date | null;
}
