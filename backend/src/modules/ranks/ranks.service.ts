import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Payout } from '../investments/entities/payout.entity';
import { Referral } from '../referrals/entities/referral.entity';

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
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyRankRewards() {
        this.logger.log('Starting daily rank rewards...');

        // Process all users
        const users = await this.userRepo.find();

        for (const user of users) {
            if (!user.walletAddress) continue;

            // Count direct referrals using the Referral table (source of truth)
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

            // Update rank if changed
            if (user.rank !== newRank) {
                user.rank = newRank;
                await this.userRepo.save(user);
                this.logger.log(`User ${user.id} promoted to ${newRank}`);
            }

            // Distribute Daily Reward
            if (reward > 0) {
                try {
                    // This updates heroBalance
                    await this.usersService.updateBalance(user.id, reward);

                    await this.payoutRepo.save({
                        userId: user.id,
                        amount: reward,
                        type: 'rank_daily',
                        investmentId: null
                    });

                    this.logger.log(`Rewarded ${reward} HERO to ${user.id} (Rank: ${newRank})`);
                } catch (e) {
                    this.logger.error(`Failed to reward user ${user.id}`, e);
                }
            }
        }
        this.logger.log('Daily rank rewards completed.');
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
