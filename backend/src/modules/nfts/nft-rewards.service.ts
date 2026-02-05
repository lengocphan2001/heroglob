import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NFT } from './entities/nft.entity';
import { NFTReward } from './entities/nft-reward.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PayoutService } from '../payouts/payout.service';

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
    async distributeDailyRewards() {
        this.logger.log('Starting daily NFT rewards distribution...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all NFTs
            const nfts = await this.nftRepo.find();
            this.logger.log(`Found ${nfts.length} NFTs to process`);

            let rewardsDistributed = 0;

            for (const nft of nfts) {
                try {
                    // Get product details
                    const product = await this.productRepo.findOne({
                        where: { id: nft.productId },
                    });

                    if (!product || Number(product.dailyHeroReward) <= 0) {
                        continue;
                    }

                    // Check if reward already distributed today
                    const existingReward = await this.rewardRepo.findOne({
                        where: {
                            nftId: nft.id,
                            rewardDate: today,
                        },
                    });

                    if (existingReward) {
                        continue;
                    }

                    // Calculate total earned for this NFT
                    const rewards = await this.rewardRepo.find({
                        where: { nftId: nft.id },
                    });

                    const totalEarned = rewards.reduce(
                        (sum, r) => sum + Number(r.rewardAmount),
                        0
                    );

                    // Check if max reward reached
                    const maxReward = Number(product.maxHeroReward);
                    if (maxReward > 0 && totalEarned >= maxReward) {
                        this.logger.log(
                            `NFT ${nft.id} has reached max reward (${maxReward} HERO)`
                        );
                        continue;
                    }

                    // Calculate reward amount (don't exceed max)
                    let rewardAmount = Number(product.dailyHeroReward);
                    if (maxReward > 0 && totalEarned + rewardAmount > maxReward) {
                        rewardAmount = maxReward - totalEarned;
                    }

                    // Create reward record
                    const reward = this.rewardRepo.create({
                        nftId: nft.id,
                        userId: nft.userId,
                        productId: nft.productId,
                        rewardAmount: rewardAmount.toFixed(6),
                        totalEarned: (totalEarned + rewardAmount).toFixed(6),
                        rewardDate: today,
                    });

                    await this.rewardRepo.save(reward);

                    // Distribute reward with kickback via PayoutService
                    await this.payoutService.distributeRewardWithKickback(nft.userId, rewardAmount, 'nft_reward');

                    rewardsDistributed++;
                } catch (error) {
                    this.logger.error(`Error processing NFT ${nft.id}:`, error);
                }
            }

            this.logger.log(
                `Daily rewards distribution completed. ${rewardsDistributed} rewards distributed.`
            );
        } catch (error) {
            this.logger.error('Error in daily rewards distribution:', error);
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
