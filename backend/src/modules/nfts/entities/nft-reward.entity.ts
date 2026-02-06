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

@Entity('nft_rewards')
export class NFTReward {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'int', name: 'nft_id' })
    @Index()
    nftId!: number;

    // The userId column is now managed by the ManyToOne relation and JoinColumn.
    // If you still need to access the raw ID, you can keep it, but it's often
    // omitted when a relation is present. For this change, we'll keep it
    // as it was in the original document, but note that the relation will
    // handle its value.
    @Column({ type: 'int', name: 'user_id', insert: false, update: false })
    @Index()
    userId!: number;

    @Column({ type: 'int', name: 'product_id' })
    @Index()
    productId!: number;

    @Column({ type: 'decimal', precision: 18, scale: 6, name: 'reward_amount' })
    rewardAmount!: string;

    @Column({ type: 'decimal', precision: 18, scale: 6, name: 'total_earned', default: 0 })
    totalEarned!: string;

    @Column({ type: 'date', name: 'reward_date' })
    @Index()
    rewardDate!: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
