import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Investment } from './entities/investment.entity';
import { Payout } from './entities/payout.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import { UsersService } from '../users/users.service';
import { PayoutService, PendingReward } from '../payouts/payout.service';

import { ActivePowerService } from '../active-power/active-power.service';

@Injectable()
export class InvestmentsService {
    private readonly logger = new Logger(InvestmentsService.name);

    constructor(
        @InjectRepository(Investment)
        private investmentRepository: Repository<Investment>,
        @InjectRepository(Payout)
        private payoutRepository: Repository<Payout>,
        private configService: SystemConfigService,
        private usersService: UsersService,
        private activePowerService: ActivePowerService,
        @Inject(forwardRef(() => PayoutService))
        private readonly payoutService: PayoutService,
    ) { }

    async activatePower(userId: number, input: { amount?: number; packageId?: number }) {
        let amount = 0;
        let profitPercent = 0;

        if (input.packageId) {
            const pkg = await this.activePowerService.findOne(input.packageId);
            if (!pkg.isActive) throw new BadRequestException('Package is not active');
            amount = Number(pkg.price);
            profitPercent = Number(pkg.dailyProfitPercent);
        } else if (input.amount) {
            amount = Number(input.amount);
            const minUsdt = parseFloat(await this.configService.get('INVESTMENT_MIN_USDT', '10'));
            if (amount < minUsdt) {
                throw new BadRequestException(`Minimum investment is ${minUsdt} USDT`);
            }
            profitPercent = parseFloat(await this.configService.get('INVESTMENT_PROFIT_PERCENT', '1'));
        } else {
            throw new BadRequestException('Invalid activation payload');
        }

        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (Number(user.heroBalance) < amount) {
            throw new BadRequestException(`Insufficient balance. You have ${user.heroBalance} USDT.`);
        }

        // Deduct balance
        await this.usersService.updateBalance(userId, -amount);

        const investment = this.investmentRepository.create({
            userId,
            amount,
            dailyProfitPercent: profitPercent,
            status: 'active',
            lastPayoutAt: new Date(),
        });

        return this.investmentRepository.save(investment);
    }

    async getUserInvestments(userId: number) {
        return this.investmentRepository.find({ where: { userId } });
    }

    async getPendingInvestmentPayouts(): Promise<PendingReward[]> {
        const activeInvestments = await this.investmentRepository.find({
            where: { status: 'active' },
            relations: ['user'],
        });

        const pending: PendingReward[] = [];
        for (const investment of activeInvestments) {
            const profit = Number(investment.amount) * (Number(investment.dailyProfitPercent) / 100);
            if (profit > 0) {
                pending.push({
                    userId: investment.userId,
                    userName: investment.user?.name,
                    wallet: investment.user?.walletAddress || undefined,
                    amount: profit,
                    type: 'investment_daily',
                    investmentId: investment.id,
                });
            }
        }
        return pending;
    }

    async handleDailyPayout() {
        this.logger.log('Starting daily payout calculation...');
        const pending = await this.getPendingInvestmentPayouts();

        for (const item of pending) {
            await this.payoutSingleInvestment(item);
        }
        this.logger.log('Daily payout completed.');
    }

    async payoutSingleInvestment(item: PendingReward) {
        try {
            if (!item.investmentId) return;
            // Distribute profit with kickback via PayoutService
            await this.payoutService.distributeRewardWithKickback(item.userId, item.amount, 'investment_daily', item.investmentId);

            const investment = await this.investmentRepository.findOne({ where: { id: item.investmentId } });
            if (investment) {
                investment.lastPayoutAt = new Date();
                await this.investmentRepository.save(investment);
            }

            await this.payoutRepository.save({
                userId: item.userId,
                investmentId: item.investmentId,
                amount: item.amount,
            });

            this.logger.log(`Payout ${item.amount} to user ${item.userId}`);
        } catch (e) {
            this.logger.error(`Failed payout for investment ${item.investmentId}`, e);
        }
    }

    async getAllPayouts() {
        return this.payoutRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user', 'investment'],
        });
    }

    async getUserPayouts(userId: number) {
        return this.payoutRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50, // Limit to last 50 transactions
        });
    }
}
