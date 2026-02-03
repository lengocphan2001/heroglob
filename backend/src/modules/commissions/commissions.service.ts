import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommissionsService {
    constructor(
        @InjectRepository(Commission)
        private readonly repo: Repository<Commission>,
        private readonly usersService: UsersService,
    ) { }

    async processPendingCommissions(): Promise<{ processed: number; failed: number }> {
        const pending = await this.repo.find({ where: { status: 'pending' } });
        let processed = 0;
        let failed = 0;

        for (const commission of pending) {
            try {
                const user = await this.usersService.findByWallet(commission.referrerWallet);
                if (user) {
                    const amount = parseFloat(commission.amount);
                    // For simplicity, add to heroBalance (or usdt depending on commission type)
                    // Usually referral rewards are in HERO
                    await this.usersService.updateBalance(user.id, amount);

                    commission.status = 'completed';
                    await this.repo.save(commission);
                    processed++;
                } else {
                    failed++;
                }
            } catch (e) {
                console.error('Error processing commission:', e);
                failed++;
            }
        }

        return { processed, failed };
    }

    async createCommission(
        referrerWallet: string,
        fromWallet: string,
        amount: string,
        tokenType: string,
        orderId: number,
    ): Promise<Commission> {
        const commission = this.repo.create({
            referrerWallet,
            fromWallet,
            amount,
            tokenType,
            orderId,
            status: 'pending',
        });
        return this.repo.save(commission);
    }

    async findAll(): Promise<Commission[]> {
        return this.repo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findByWallet(wallet: string): Promise<Commission[]> {
        return this.repo.find({
            where: { referrerWallet: wallet },
            order: { createdAt: 'DESC' },
        });
    }

    async getStats(wallet: string): Promise<{ totalEarned: number; pending: number }> {
        const commissions = await this.repo.find({ where: { referrerWallet: wallet } });
        let totalEarned = 0;
        let pending = 0;

        for (const c of commissions) {
            const val = parseFloat(c.amount);
            if (c.status === 'completed') {
                totalEarned += val;
            } else {
                pending += val;
            }
        }

        return { totalEarned, pending };
    }
}
