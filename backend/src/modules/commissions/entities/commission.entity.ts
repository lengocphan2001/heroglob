import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('commissions')
export class Commission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 42, name: 'referrer_wallet' })
    @Index()
    referrerWallet: string;

    @Column({ type: 'varchar', length: 42, name: 'from_wallet' })
    fromWallet: string;

    @Column({ type: 'decimal', precision: 20, scale: 6 })
    amount: string;

    @Column({ type: 'varchar', length: 10, name: 'token_type' })
    tokenType: string;

    @Column({ type: 'int', name: 'order_id' })
    orderId: number;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: string; // 'pending' | 'completed'

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
