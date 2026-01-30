import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WithdrawalsService {
    constructor(
        @InjectRepository(Withdrawal)
        private withdrawalRepo: Repository<Withdrawal>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async createWithdrawal(
        userId: number,
        walletAddress: string,
        toAddress: string,
        amount: number,
        tokenType: 'usdt' | 'hero',
    ) {
        // Validate amount
        if (amount <= 0) {
            throw new BadRequestException('Số tiền phải lớn hơn 0');
        }

        // Get user
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Người dùng không tồn tại');
        }

        // Check balance
        const balance = tokenType === 'usdt' ? Number(user.usdtBalance) : Number(user.heroBalance);
        if (balance < amount) {
            throw new BadRequestException('Số dư không đủ');
        }

        // Deduct balance
        if (tokenType === 'usdt') {
            user.usdtBalance = balance - amount;
        } else {
            user.heroBalance = balance - amount;
        }
        await this.userRepo.save(user);

        // Create withdrawal request
        const withdrawal = this.withdrawalRepo.create({
            userId,
            walletAddress: walletAddress.toLowerCase(),
            toAddress: toAddress.toLowerCase(),
            amount: amount.toFixed(6),
            tokenType,
            status: 'pending',
        });

        return this.withdrawalRepo.save(withdrawal);
    }

    async getUserWithdrawals(userId: number, walletAddress: string) {
        return this.withdrawalRepo.find({
            where: [
                { userId },
                { walletAddress: walletAddress?.toLowerCase() },
            ],
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async getAllWithdrawals() {
        return this.withdrawalRepo.find({
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }

    async updateStatus(
        id: number,
        status: 'processing' | 'completed' | 'rejected',
        txHash?: string,
        rejectReason?: string,
    ) {
        const withdrawal = await this.withdrawalRepo.findOne({ where: { id } });
        if (!withdrawal) {
            throw new BadRequestException('Withdrawal not found');
        }

        // If rejected, refund the user
        if (status === 'rejected' && withdrawal.status === 'pending') {
            const user = await this.userRepo.findOne({ where: { id: withdrawal.userId } });
            if (user) {
                const refundAmount = Number(withdrawal.amount);
                if (withdrawal.tokenType === 'usdt') {
                    user.usdtBalance = Number(user.usdtBalance) + refundAmount;
                } else {
                    user.heroBalance = Number(user.heroBalance) + refundAmount;
                }
                await this.userRepo.save(user);
            }
        }

        withdrawal.status = status;
        if (txHash) withdrawal.txHash = txHash;
        if (rejectReason) withdrawal.rejectReason = rejectReason;

        return this.withdrawalRepo.save(withdrawal);
    }
}
