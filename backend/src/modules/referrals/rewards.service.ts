import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Referral } from './entities/referral.entity';

@Injectable()
export class RewardsService {
    private readonly logger = new Logger(RewardsService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Referral)
        private readonly referralRepo: Repository<Referral>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyRewards() {
        this.logger.log('Starting daily reward calculation...');

        // Group referrals by referrer
        const stats = await this.referralRepo
            .createQueryBuilder('ref')
            .select('ref.referrer_wallet', 'wallet')
            .addSelect('COUNT(ref.id)', 'count')
            .groupBy('ref.referrer_wallet')
            .getRawMany();

        for (const stat of stats) {
            const wallet = stat.wallet;
            const count = parseInt(stat.count, 10);
            let reward = 0;

            if (count >= 1000) reward = 8000;
            else if (count >= 200) reward = 2000;
            else if (count >= 50) reward = 500;
            else if (count >= 10) reward = 100;

            if (reward > 0) {
                // Update user balance
                // Note: Ideally we should track transaction history, but for now just updating balance
                const user = await this.userRepo.findOne({ where: { walletAddress: wallet } });
                if (user) {
                    // Assuming user.heroBalance is number, but it's decimal in DB so TypeORM might return string
                    // We cast to number for calculation
                    const currentBalance = Number(user.heroBalance);
                    user.heroBalance = currentBalance + reward;
                    await this.userRepo.save(user);
                    this.logger.log(`Rewarded ${reward} HERO to ${wallet} (Ref count: ${count})`);
                }
            }
        }

        this.logger.log('Daily reward calculation completed.');
    }
}
