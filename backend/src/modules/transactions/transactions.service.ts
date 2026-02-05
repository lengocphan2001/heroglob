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

    async getUserHistory(userId: number, walletAddress: string): Promise<TransactionHistoryItem[]> {
        if (!userId || !walletAddress) {
            return [];
        }
        const transactions: TransactionHistoryItem[] = [];

        // Get user orders
        const orders = await this.orderRepo.find({
            where: { walletAddress: walletAddress?.toLowerCase() },
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

        // Get commissions (affiliate earnings)
        const commissions = await this.commissionRepo.find({
            where: { referrerWallet: walletAddress?.toLowerCase() },
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

        // Get payouts (investment & rank rewards)
        const payouts = await this.payoutRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });

        for (const payout of payouts) {
            let description = 'Thanh toán';
            if (payout.type === 'rank_daily') {
                description = 'Thưởng hạng';
            } else if (payout.type === 'investment_daily') {
                description = 'Lợi nhuận đầu tư';
            }

            transactions.push({
                id: `payout-${payout.id}`,
                type: 'payout',
                amount: Number(payout.amount),
                tokenType: 'hero',
                description,
                createdAt: payout.createdAt,
                metadata: {
                    payoutType: payout.type,
                    investmentId: payout.investmentId,
                },
            });
        }

        // Get NFT rewards
        const nftRewards = await this.nftRewardRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });

        for (const reward of nftRewards) {
            transactions.push({
                id: `nft-reward-${reward.id}`,
                type: 'nft_reward',
                amount: Number(reward.rewardAmount),
                tokenType: 'hero',
                description: 'Phần thưởng NFT hàng ngày',
                createdAt: reward.createdAt,
                metadata: {
                    nftId: reward.nftId,
                    productId: reward.productId,
                    rewardDate: reward.rewardDate,
                },
            });
        }

        // Sort all transactions by date (most recent first)
        transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Return top 100 most recent
        return transactions.slice(0, 100);
    }
}
