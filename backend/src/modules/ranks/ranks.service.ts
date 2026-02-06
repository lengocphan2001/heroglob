import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Payout } from '../investments/entities/payout.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { PayoutService, PendingReward } from '../payouts/payout.service';

@Injectable()
export class RanksService {
    private readonly logger = new Logger(RanksService.name);

    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Payout)
        private readonly payoutRepo: Repository<Payout>,
        @InjectRepository(Referral)
        private readonly referralRepo: Repository<Referral>,
        @Inject(forwardRef(() => PayoutService))
        private readonly payoutService: PayoutService,
    ) { }

    async getPendingRankRewards(): Promise<PendingReward[]> {
        const users = await this.userRepo.find();
        const pending: PendingReward[] = [];

        for (const user of users) {
            if (!user.walletAddress) continue;

            const referrals = await this.referralRepo.count({
                where: { referrerWallet: user.walletAddress.toLowerCase() }
            });

            let newRank = 'member';
            let reward = 0;

            if (referrals >= 1000) {
                newRank = 'legendary';
                reward = 8000;
            } else if (referrals >= 200) {
                newRank = 'epic';
                reward = 2000;
            } else if (referrals >= 50) {
                newRank = 'rare';
                reward = 500;
            } else if (referrals >= 10) {
                newRank = 'normal';
                reward = 100;
            }

            if (reward > 0) {
                pending.push({
                    userId: user.id,
                    userName: user.name,
                    wallet: user.walletAddress,
                    amount: reward,
                    type: 'rank_daily',
                    metadata: { newRank, referrals }
                });
            }
        }
        return pending;
    }

    async handleDailyRankRewards() {
        this.logger.log('Starting daily rank rewards...');
        const pending = await this.getPendingRankRewards();

        for (const item of pending) {
            await this.payoutSingleRankReward(item);
        }
        this.logger.log('Daily rank rewards completed.');
    }

    async payoutSingleRankReward(item: PendingReward) {
        try {
            const user = await this.userRepo.findOne({ where: { id: item.userId } });
            if (!user) {
                this.logger.warn(`User with ID ${item.userId} not found for rank reward.`);
                return;
            }

            // Update rank
            if (user.rank !== item.metadata.newRank) {
                user.rank = item.metadata.newRank;
                await this.userRepo.save(user);
                this.logger.log(`User ${user.id} promoted to ${item.metadata.newRank}`);
            }

            // This handles heroBalance and referral kickback
            await this.payoutService.distributeRewardWithKickback(item.userId, item.amount, 'rank_daily');

            await this.payoutRepo.save({
                userId: item.userId,
                amount: item.amount,
                type: 'rank_daily',
                investmentId: null
            });

            this.logger.log(`Rewarded ${item.amount} HERO to ${item.userId} (Rank: ${item.metadata.newRank})`);
        } catch (e) {
            this.logger.error(`Failed to reward user ${item.userId}`, e);
        }
    }

    async getRankStats(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user || !user.walletAddress) return null;

        const referrals = await this.referralRepo.count({
            where: { referrerWallet: user.walletAddress.toLowerCase() }
        });

        let nextRank = 'normal';
        let target = 10;

        if (referrals >= 1000) {
            nextRank = 'max';
            target = 1000;
        } else if (referrals >= 200) {
            nextRank = 'legendary';
            target = 1000;
        } else if (referrals >= 50) {
            nextRank = 'epic';
            target = 200;
        } else if (referrals >= 10) {
            nextRank = 'rare';
            target = 50;
        }

        return {
            currentRank: user.rank,
            referrals,
            nextRank,
            target,
            referralCode: user.referralCode,
        };
    }
}
