import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('withdrawals')
export class Withdrawal {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'user_id' })
    @Index()
    userId!: number;

    @Column({ type: 'varchar', length: 42, name: 'wallet_address' })
    @Index()
    walletAddress!: string;

    @Column({ type: 'varchar', length: 42, name: 'to_address' })
    toAddress!: string;

    @Column({ type: 'decimal', precision: 20, scale: 6 })
    amount!: string;

    @Column({ type: 'varchar', length: 10, name: 'token_type' })
    tokenType!: string; // 'usdt' or 'hero'

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    @Index()
    status!: string; // 'pending', 'processing', 'completed', 'rejected'

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'tx_hash' })
    txHash!: string | null;

    @Column({ type: 'text', nullable: true, name: 'reject_reason' })
    rejectReason!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
