import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';

@Injectable()
export class CommissionsService {
    constructor(
        @InjectRepository(Commission)
        private readonly repo: Repository<Commission>,
    ) { }

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
