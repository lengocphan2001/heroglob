import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SystemConfigService } from '../system-config/system-config.service';
import { RanksService } from '../ranks/ranks.service';
import { InvestmentsService } from '../investments/investments.service';
import { NFTRewardsService } from '../nfts/nft-rewards.service';
import { UsersService } from '../users/users.service';
import { ethers } from 'ethers';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payout } from '../investments/entities/payout.entity';

export interface PendingReward {
    userId: number;
    userName?: string;
    wallet?: string;
    amount: number;
    type: string;
    investmentId?: number | null;
    nftId?: number | null;
    metadata?: any;
}

@Injectable()
export class PayoutService {
    private readonly logger = new Logger(PayoutService.name);

    constructor(
        private readonly configService: SystemConfigService,
        @Inject(forwardRef(() => RanksService))
        private readonly ranksService: RanksService,
        @Inject(forwardRef(() => InvestmentsService))
        private readonly investmentsService: InvestmentsService,
        @Inject(forwardRef(() => NFTRewardsService))
        private readonly nftRewardsService: NFTRewardsService,
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Payout)
        private readonly payoutRepo: Repository<Payout>,
    ) { }

    async distributeRewardWithKickback(userId: number, amount: number, type: string, investmentId: number | null = null) {
        if (amount <= 0) return;

        try {
            // 1. Give reward to user
            await this.usersService.updateBalance(userId, amount);

            // 2. Look for referrer
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (user && user.referredById) {
                const kickbackAmount = amount * 0.10;
                if (kickbackAmount > 0) {
                    this.logger.log(`Processing 10% kickback for referrer of user ${userId}: ${kickbackAmount}`);

                    // Give kickback to referrer
                    await this.usersService.updateBalance(user.referredById, kickbackAmount);

                    // Record kickback
                    await this.payoutRepo.save({
                        userId: user.referredById,
                        amount: kickbackAmount,
                        type: 'referral_kickback',
                        investmentId: null
                    });

                    this.logger.log(`Rewarded ${kickbackAmount} HERO to referrer ${user.referredById} of user ${userId}`);
                }
            }
        } catch (error) {
            this.logger.error(`Failed to distribute reward with kickback for user ${userId}:`, error);
        }
    }

    async getPendingPayouts(): Promise<PendingReward[]> {
        const [rankRewards, investmentPayouts, nftRewards] = await Promise.all([
            this.ranksService.getPendingRankRewards(),
            this.investmentsService.getPendingInvestmentPayouts(),
            this.nftRewardsService.getPendingNFTRewards(),
        ]);

        return [...rankRewards, ...investmentPayouts, ...nftRewards];
    }

    async processDailyPayouts(selectedRewards?: PendingReward[]) {
        this.logger.log('Starting daily payouts processing...');

        const mode = await this.configService.get('PAYOUT_MODE', 'on-chain');
        this.logger.log(`Payout Mode: ${mode}`);

        if (selectedRewards) {
            this.logger.log(`Processing ${selectedRewards.length} selected rewards...`);
            await this.processSelectedPayouts(selectedRewards);
            return;
        }

        if (mode === 'internal') {
            await this.processInternalPayouts();
        } else if (mode === 'on-chain') {
            await this.processOnChainPayouts();
        } else {
            this.logger.error(`Unknown payout mode: ${mode}`);
        }
    }

    private async processSelectedPayouts(selectedRewards: PendingReward[]) {
        for (const item of selectedRewards) {
            try {
                if (item.type === 'rank_daily') {
                    // Logic for rank payout (we might need to expose a single item processor in RanksService)
                    // For now, let's just use distributeRewardWithKickback if appropriate, 
                    // but RanksService also updates the rank itself.
                    // I should probably add individual payout methods to the services.
                    await this.ranksService.payoutSingleRankReward(item);
                } else if (item.type === 'investment_daily') {
                    await this.investmentsService.payoutSingleInvestment(item);
                } else if (item.type === 'nft_reward') {
                    await this.nftRewardsService.payoutSingleNFTReward(item);
                }
            } catch (error) {
                this.logger.error(`Failed to process selected payout for user ${item.userId} (${item.type}):`, error);
            }
        }
    }

    private async processInternalPayouts() {
        try {
            this.logger.log('Processing Rank Rewards (Internal)...');
            await this.ranksService.handleDailyRankRewards();

            this.logger.log('Processing Investment Payouts (Internal)...');
            await this.investmentsService.handleDailyPayout();

            this.logger.log('Processing NFT Rewards (Internal)...');
            await this.nftRewardsService.distributeDailyRewards();

            this.logger.log('Internal payouts processed successfully.');
        } catch (error) {
            this.logger.error('Error during internal payouts:', error);
        }
    }

    private async processOnChainPayouts() {
        this.logger.warn('On-chain payout mode selected. This requires RPC_URL and PAYOUT_PRIVATE_KEY in .env');

        // Always run internal payouts to maintain database consistency
        await this.processInternalPayouts();

        // TODO: Implement batching logic to send aggregate transactions for on-chain distribution.
        this.logger.log('On-chain payout infrastructure ready. Aggregate data batches for contract execution.');
    }

    async executeOnChainPayout(recipients: { address: string, amount: string }[]) {
        const rpcUrl = process.env.RPC_URL;
        const privateKey = process.env.PAYOUT_PRIVATE_KEY;
        const payoutContractAddress = process.env.PAYOUT_CONTRACT_ADDRESS;
        const tokenAddress = process.env.PAYOUT_TOKEN_ADDRESS; // Project token or USDT depending on context

        if (!rpcUrl || !privateKey || !payoutContractAddress || !tokenAddress) {
            this.logger.error('Missing on-chain payout configuration (RPC_URL, PAYOUT_PRIVATE_KEY, PAYOUT_CONTRACT_ADDRESS, or PAYOUT_TOKEN_ADDRESS)');
            return;
        }

        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);

            // Minimal ABI for a multisend/payout contract
            const abi = [
                "function payout(address token, address[] recipients, uint256[] amounts) external"
            ];

            const contract = new ethers.Contract(payoutContractAddress, abi, wallet);

            const addresses = recipients.map(r => r.address);
            const amounts = recipients.map(r => ethers.parseUnits(r.amount, 18)); // Assuming 18 decimals

            this.logger.log(`Sending on-chain transaction to ${payoutContractAddress}...`);
            const tx = await contract.payout(tokenAddress, addresses, amounts);
            await tx.wait();
            this.logger.log(`On-chain payout successful! Hash: ${tx.hash}`);
        } catch (error) {
            this.logger.error('Failed to execute on-chain payout:', error);
        }
    }
}
