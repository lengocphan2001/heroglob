import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('nft_rewards')
export class NFTReward {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'nft_id' })
    @Index()
    nftId!: number;

    @Column({ type: 'int', name: 'user_id' })
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
