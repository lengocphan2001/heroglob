import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NFT } from './entities/nft.entity';
import { NFTReward } from './entities/nft-reward.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PayoutService, PendingReward } from '../payouts/payout.service';

@Injectable()
export class NFTRewardsService {
    private readonly logger = new Logger(NFTRewardsService.name);

    constructor(
        @InjectRepository(NFT)
        private nftRepo: Repository<NFT>,
        @InjectRepository(NFTReward)
        private rewardRepo: Repository<NFTReward>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @Inject(forwardRef(() => PayoutService))
        private readonly payoutService: PayoutService,
    ) { }

    // Run daily at midnight
    async getPendingNFTRewards(): Promise<PendingReward[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nfts = await this.nftRepo.find({ relations: ['user'] });
        const pending: PendingReward[] = [];

        for (const nft of nfts) {
            const product = await this.productRepo.findOne({
                where: { id: nft.productId },
            });

            if (!product || Number(product.dailyHeroReward) <= 0) continue;

            const existingReward = await this.rewardRepo.findOne({
                where: { nftId: nft.id, rewardDate: today },
            });

            if (existingReward) continue;

            const rewards = await this.rewardRepo.find({ where: { nftId: nft.id } });
            const totalEarned = rewards.reduce((sum, r) => sum + Number(r.rewardAmount), 0);

            const maxReward = Number(product.maxHeroReward);
            if (maxReward > 0 && totalEarned >= maxReward) continue;

            let rewardAmount = Number(product.dailyHeroReward);
            if (maxReward > 0 && totalEarned + rewardAmount > maxReward) {
                rewardAmount = maxReward - totalEarned;
            }

            pending.push({
                userId: nft.userId,
                userName: nft.user?.name,
                wallet: nft.user?.walletAddress || undefined,
                amount: rewardAmount,
                type: 'nft_reward',
                nftId: nft.id,
                metadata: { productId: nft.productId }
            });
        }
        return pending;
    }

    async distributeDailyRewards() {
        this.logger.log('Starting daily NFT rewards distribution...');
        const pending = await this.getPendingNFTRewards();

        let rewardsDistributed = 0;
        for (const item of pending) {
            const success = await this.payoutSingleNFTReward(item);
            if (success) rewardsDistributed++;
        }

        this.logger.log(`Daily rewards distribution completed. ${rewardsDistributed} rewards distributed.`);
    }

    async payoutSingleNFTReward(item: PendingReward): Promise<boolean> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            if (!item.nftId) return false;
            // Calculate total earned again to be safe in concurrent scenarios if needed, 
            // but for simple cron it's fine.
            const rewards = await this.rewardRepo.find({ where: { nftId: item.nftId } });
            const totalEarned = rewards.reduce((sum, r) => sum + Number(r.rewardAmount), 0);

            const reward = this.rewardRepo.create({
                nftId: item.nftId,
                userId: item.userId,
                productId: item.metadata.productId,
                rewardAmount: item.amount.toFixed(6),
                totalEarned: (totalEarned + item.amount).toFixed(6),
                rewardDate: today,
            });

            await this.rewardRepo.save(reward);
            await this.payoutService.distributeRewardWithKickback(item.userId, item.amount, 'nft_reward');
            return true;
        } catch (error) {
            this.logger.error(`Error processing NFT ${item.nftId}:`, error);
            return false;
        }
    }

    async getNFTRewards(nftId: number) {
        return this.rewardRepo.find({
            where: { nftId },
            order: { rewardDate: 'DESC' },
        });
    }

    async getUserTotalRewards(userId: number) {
        const rewards = await this.rewardRepo.find({
            where: { userId },
        });

        const total = rewards.reduce((sum, r) => sum + Number(r.rewardAmount), 0);
        return {
            totalRewards: total.toFixed(6),
            rewardsCount: rewards.length,
        };
    }
}
