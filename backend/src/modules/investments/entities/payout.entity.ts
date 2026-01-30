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

    @Column({ name: 'investment_id', nullable: true })
    investmentId!: number | null;

    @ManyToOne(() => Investment)
    @JoinColumn({ name: 'investment_id' })
    investment!: Investment | null;

    @Column({ type: 'decimal', precision: 20, scale: 2 })
    amount!: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'tx_hash' })
    txHash!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'investment_daily' })
    type!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
