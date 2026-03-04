import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Investment } from './entities/investment.entity';
import { Payout } from './entities/payout.entity';
import { Order } from '../orders/entities/order.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import { UsersService } from '../users/users.service';
import { ActivePowerService } from '../active-power/active-power.service';

const PAYOUT_CRON_NAME = 'scheduled-payout';

@Injectable()
export class InvestmentsService implements OnModuleInit {
    private readonly logger = new Logger(InvestmentsService.name);

    constructor(
        @InjectRepository(Investment)
        private investmentRepository: Repository<Investment>,
        @InjectRepository(Payout)
        private payoutRepository: Repository<Payout>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private configService: SystemConfigService,
        private usersService: UsersService,
        private activePowerService: ActivePowerService,
        private scheduler: SchedulerRegistry,
    ) { }

    async onModuleInit() {
        const hour = parseInt(await this.configService.get('PAYOUT_UTC_HOUR', '0'), 10);
        const minute = parseInt(await this.configService.get('PAYOUT_UTC_MINUTE', '0'), 10);
        const cronExpression = `${minute} ${hour} * * *`;
        const job = new CronJob(cronExpression, () => {
            this.handleDailyPayout().catch((e) => this.logger.error('Payout job failed', e));
        });
        try {
            this.scheduler.addCronJob(PAYOUT_CRON_NAME, job);
            job.start();
            this.logger.log(`Payout cron registered: daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`);
        } catch {
            job.start();
        }
    }

    async activatePower(userId: number, input: { amount?: number; packageId?: number }) {
        let amount = 0;
        let profitPercent = 0;
        let durationDays = 1;

        if (input.packageId) {
            const pkg = await this.activePowerService.findOne(input.packageId);
            if (!pkg.isActive) throw new BadRequestException('Package is not active');
            amount = Number(pkg.price);
            profitPercent = Number(pkg.dailyProfitPercent);
            durationDays = Number(pkg.durationDays) || 1;
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

        await this.usersService.updateBalance(userId, -amount);

        const investment = this.investmentRepository.create({
            userId,
            amount,
            dailyProfitPercent: profitPercent,
            durationDays,
            status: 'active',
            lastPayoutAt: null,
        });
        const saved = await this.investmentRepository.save(investment);

        const payoutHour = parseInt(await this.configService.get('PAYOUT_UTC_HOUR', '0'), 10);
        const payoutMinute = parseInt(await this.configService.get('PAYOUT_UTC_MINUTE', '0'), 10);
        const dailyProfit = amount * (profitPercent / 100);
        const walletAddress = user.walletAddress || null;
        const baseDate = new Date(saved.createdAt);

        for (let day = 1; day <= durationDays; day++) {
            const scheduledAt = new Date(Date.UTC(
                baseDate.getUTCFullYear(),
                baseDate.getUTCMonth(),
                baseDate.getUTCDate() + day,
                payoutHour,
                payoutMinute,
                0,
                0,
            ));
            await this.payoutRepository.save({
                userId,
                investmentId: saved.id,
                orderId: null,
                walletAddress,
                amount: dailyProfit,
                type: 'investment_daily',
                scheduledAt,
                status: 'pending',
            });
        }
        this.logger.log(`Scheduled ${durationDays} daily payouts for investment ${saved.id}`);
        return saved;
    }

    /**
     * Credit user balance with paid amount (from on-chain payment), then activate the package.
     * Frontend sends USDT via wallet, then calls this with txHash and amount.
     */
    async activateWithPayment(
        userId: number,
        input: { packageId: number; txHash: string; amount: string },
    ) {
        const amount = parseFloat(input.amount);
        if (!input.txHash?.trim() || Number.isNaN(amount) || amount <= 0) {
            throw new BadRequestException('Invalid payment data (txHash and amount required)');
        }
        const pkg = await this.activePowerService.findOne(input.packageId);
        if (!pkg?.isActive) throw new BadRequestException('Package not found or not active');
        const packagePrice = Number(pkg.price);
        if (Math.abs(amount - packagePrice) > 0.01) {
            throw new BadRequestException(`Amount must match package price (${packagePrice})`);
        }
        await this.usersService.updateBalance(userId, amount);
        return this.activatePower(userId, { packageId: input.packageId });
    }

    async getUserInvestments(userId: number) {
        return this.investmentRepository.find({ where: { userId } });
    }

    /** Runs once per day at the configured PAYOUT_UTC_HOUR:PAYOUT_UTC_MINUTE (UTC). */
    async handleDailyPayout() {
        const now = new Date();
        this.logger.log('Processing scheduled payouts...');
        const due = await this.payoutRepository.find({
            where: { status: 'pending' },
            order: { scheduledAt: 'ASC' },
        });
        const toProcess = due.filter((p) => p.scheduledAt && new Date(p.scheduledAt) <= now);

        for (const payout of toProcess) {
            try {
                const amount = Number(payout.amount);
                // Package (Active Power): pay USDT in-app balance. Product & rank: pay token (HERO) in-app balance.
                if (payout.type === 'investment_daily') {
                    await this.usersService.updateUsdtBalance(payout.userId, amount);
                } else {
                    await this.usersService.updateBalance(payout.userId, amount);
                }
                payout.status = 'paid';
                await this.payoutRepository.save(payout);
                this.logger.log(`Payout ${payout.amount} to user ${payout.userId} (${payout.type})`);
            } catch (e) {
                this.logger.error(`Failed payout ${payout.id} for user ${payout.userId}`, e);
                payout.status = 'failed';
                await this.payoutRepository.save(payout);
            }
        }
        if (toProcess.length > 0) {
            this.logger.log(`Daily payout completed: ${toProcess.length} paid.`);
        }
    }

    /** Called when admin triggers payout manually (e.g. from controller). */
    async runScheduledPayoutsNow() {
        const now = new Date();
        const due = await this.payoutRepository.find({
            where: { status: 'pending' },
            order: { scheduledAt: 'ASC' },
        });
        const toProcess = due.filter((p) => p.scheduledAt && new Date(p.scheduledAt) <= now);
        for (const payout of toProcess) {
            try {
                const amount = Number(payout.amount);
                if (payout.type === 'investment_daily') {
                    await this.usersService.updateUsdtBalance(payout.userId, amount);
                } else {
                    await this.usersService.updateBalance(payout.userId, amount);
                }
                payout.status = 'paid';
                await this.payoutRepository.save(payout);
            } catch (e) {
                this.logger.error(`Failed payout ${payout.id}`, e);
                payout.status = 'failed';
                await this.payoutRepository.save(payout);
            }
        }
        return toProcess.length;
    }

    /**
     * Schedule daily payout records for a product purchase. Uses fixed amount per day (product Daily HERO Reward),
     * capped by total days (optionally limited by product Max HERO Reward). Called from OrdersService.
     */
    async scheduleOrderPayouts(
        userId: number,
        walletAddress: string | null,
        orderId: number,
        amountPerDay: number,
        numberOfDays: number,
    ): Promise<void> {
        if (numberOfDays <= 0 || amountPerDay <= 0) return;

        const payoutHour = parseInt(await this.configService.get('PAYOUT_UTC_HOUR', '0'), 10);
        const payoutMinute = parseInt(await this.configService.get('PAYOUT_UTC_MINUTE', '0'), 10);
        const baseDate = new Date();

        for (let day = 1; day <= numberOfDays; day++) {
            const scheduledAt = new Date(Date.UTC(
                baseDate.getUTCFullYear(),
                baseDate.getUTCMonth(),
                baseDate.getUTCDate() + day,
                payoutHour,
                payoutMinute,
                0,
                0,
            ));
            await this.payoutRepository.save({
                userId,
                investmentId: null,
                orderId,
                walletAddress,
                amount: amountPerDay,
                type: 'order_daily',
                scheduledAt,
                status: 'pending',
            });
        }
        this.logger.log(`Scheduled ${numberOfDays} order_daily payouts for order ${orderId} (${amountPerDay} HERO/day)`);
    }

    /**
     * Update all pending order_daily payouts for orders of this product to the new Daily HERO Reward.
     * Called when admin updates product's dailyHeroReward so existing orders (e.g. Order #15) show the new amount.
     */
    async updatePendingOrderPayoutAmountsForProduct(productId: number, dailyHeroReward: number): Promise<void> {
        if (dailyHeroReward <= 0) return;
        const orders = await this.orderRepository.find({ where: { productId }, select: ['id'] });
        const orderIds = orders.map((o) => o.id);
        if (orderIds.length === 0) return;

        const payouts = await this.payoutRepository.find({
            where: { orderId: In(orderIds), type: 'order_daily', status: 'pending' },
        });
        for (const p of payouts) {
            p.amount = dailyHeroReward;
            await this.payoutRepository.save(p);
        }
        if (payouts.length > 0) {
            this.logger.log(`Updated ${payouts.length} pending order_daily payouts for product ${productId} to ${dailyHeroReward} HERO each`);
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
            order: { scheduledAt: 'ASC', createdAt: 'DESC' },
            take: 200,
        });
    }
}
