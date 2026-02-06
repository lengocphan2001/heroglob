import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('nfts')
export class NFT {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'int', name: 'user_id' })
    @Index()
    userId!: number;

    @Column({ type: 'varchar', length: 42, name: 'wallet_address' })
    @Index()
    walletAddress!: string;

    @Column({ type: 'int', name: 'product_id' })
    @Index()
    productId!: number;

    @Column({ type: 'int', name: 'order_id', nullable: true })
    orderId!: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    metadata!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
