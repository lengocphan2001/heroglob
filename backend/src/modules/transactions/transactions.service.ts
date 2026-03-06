import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Commission } from '../commissions/entities/commission.entity';
import { Payout } from '../investments/entities/payout.entity';
import { NFTReward } from '../nfts/entities/nft-reward.entity';

export type TransactionHistoryItem = {
    id: string;
    type: 'order' | 'commission' | 'payout' | 'nft_reward';
    amount: number;
    tokenType?: string;
    description: string;
    status?: string;
    createdAt: Date;
    metadata?: any;
};

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,
        @InjectRepository(Commission)
        private commissionRepo: Repository<Commission>,
        @InjectRepository(Payout)
        private payoutRepo: Repository<Payout>,
        @InjectRepository(NFTReward)
        private nftRewardRepo: Repository<NFTReward>,
    ) { }

    async getUserHistory(userId: number, walletAddress: string | null | undefined): Promise<TransactionHistoryItem[]> {
        const transactions: TransactionHistoryItem[] = [];
        const wallet = walletAddress?.trim()?.toLowerCase();

        // Get user orders – only when we have a wallet address (avoid returning all)
        if (wallet) {
            const orders = await this.orderRepo.find({
                where: { walletAddress: wallet },
                relations: ['product'],
                order: { createdAt: 'DESC' },
                take: 50,
            });

            for (const order of orders) {
            transactions.push({
                id: `order-${order.id}`,
                type: 'order',
                amount: -Number(order.amount),
                tokenType: order.tokenType,
                description: order.product?.title || 'Đơn hàng',
                status: order.status,
                createdAt: order.createdAt,
                metadata: {
                    productId: order.productId,
                    txHash: order.txHash,
                },
            });
            }
        }

        // Get commissions (affiliate earnings) – only when we have a wallet address
        if (wallet) {
            const commissions = await this.commissionRepo.find({
                where: { referrerWallet: wallet },
                order: { createdAt: 'DESC' },
                take: 50,
            });

            for (const commission of commissions) {
            transactions.push({
                id: `commission-${commission.id}`,
                type: 'commission',
                amount: Number(commission.amount),
                tokenType: commission.tokenType,
                description: 'Hoa hồng giới thiệu',
                status: commission.status,
                createdAt: commission.createdAt,
                metadata: {
                    fromWallet: commission.fromWallet,
                    orderId: commission.orderId,
                },
            });
            }
        }

        // Get payouts (investment & rank rewards) – only paid (credited to user)
        const payouts = await this.payoutRepo.find({
            where: { userId, status: 'paid' },
            order: { createdAt: 'DESC' },
            take: 50,
        });

        for (const payout of payouts) {
            let description = 'Thanh toán';
            if (payout.type === 'rank_daily') {
                description = 'Thưởng hạng';
            } else if (payout.type === 'investment_daily') {
                description = 'Lợi nhuận đầu tư';
            } else if (payout.type === 'order_daily') {
                description = 'Thưởng mua sản phẩm';
            }

            // Use scheduledAt as the transaction date so payouts appear when they were paid, not when the schedule was created
            const payoutDate = payout.scheduledAt ? new Date(payout.scheduledAt) : payout.createdAt;

            // Package payouts are USDT in-app; product and rank payouts are token (HERO) in-app.
            const tokenType = payout.type === 'investment_daily' ? 'usdt' : 'hero';
            transactions.push({
                id: `payout-${payout.id}`,
                type: 'payout',
                amount: Number(payout.amount),
                tokenType,
                description,
                createdAt: payoutDate,
                metadata: {
                    payoutType: payout.type,
                    investmentId: payout.investmentId,
                    orderId: payout.orderId ?? undefined,
                },
            });
        }

        // Get NFT rewards – aggregate by reward date so we show one "Phần thưởng NFT hàng ngày" per day
        const nftRewards = await this.nftRewardRepo.find({
            where: { userId },
            order: { rewardDate: 'DESC' },
            take: 200,
        });

        const nftRewardsByDate = new Map<string, { total: number; date: Date }>();
        for (const reward of nftRewards) {
            const d = reward.rewardDate instanceof Date ? reward.rewardDate : new Date(reward.rewardDate);
            const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
            const existing = nftRewardsByDate.get(key);
            const amount = Number(reward.rewardAmount);
            if (existing) {
                existing.total += amount;
            } else {
                nftRewardsByDate.set(key, { total: amount, date: d });
            }
        }
        for (const [key, { total, date }] of nftRewardsByDate) {
            transactions.push({
                id: `nft-reward-day-${key}`,
                type: 'nft_reward',
                amount: total,
                tokenType: 'hero',
                description: 'Phần thưởng NFT hàng ngày',
                createdAt: date,
                metadata: { rewardDate: key },
            });
        }

        // Sort all transactions by date (most recent first)
        transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Return top 100 most recent
        return transactions.slice(0, 100);
    }
}
