import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Investment } from './entities/investment.entity';
import { Payout } from './entities/payout.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import { UsersService } from '../users/users.service';

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
    ) { }

    async activatePower(userId: number, amount: number) {
        const minUsdt = parseFloat(await this.configService.get('INVESTMENT_MIN_USDT', '10'));
        if (amount < minUsdt) {
            throw new BadRequestException(`Minimum investment is ${minUsdt} USDT`);
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

        const profitPercent = parseFloat(await this.configService.get('INVESTMENT_PROFIT_PERCENT', '1'));

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

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyPayout() {
        this.logger.log('Starting daily payout calculation...');

        const activeInvestments = await this.investmentRepository.find({
            where: { status: 'active' },
        });

        for (const investment of activeInvestments) {
            const profit = Number(investment.amount) * (Number(investment.dailyProfitPercent) / 100);

            try {
                await this.usersService.updateBalance(investment.userId, profit);
                investment.lastPayoutAt = new Date();
                await this.investmentRepository.save(investment);

                await this.payoutRepository.save({
                    userId: investment.userId,
                    investmentId: investment.id,
                    amount: profit,
                });

                this.logger.log(`Payout ${profit} to user ${investment.userId}`);
            } catch (e) {
                this.logger.error(`Failed payout for investment ${investment.id}`, e);
            }
        }
        this.logger.log('Daily payout completed.');
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
