import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InvestmentsService } from '../investments/investments.service';
import { OrdersService } from '../orders/orders.service';
import { CommissionsService } from '../commissions/commissions.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly usersService: UsersService,
        private readonly investmentsService: InvestmentsService,
        private readonly ordersService: OrdersService,
        private readonly commissionsService: CommissionsService,
        private readonly withdrawalsService: WithdrawalsService,
    ) { }

    async getUserDetail(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        const wallet = user.walletAddress || '';

        const [payouts, investments, orders, commissions, withdrawals, referrer, totalReferred] = await Promise.all([
            this.investmentsService.getUserPayouts(userId),
            this.investmentsService.getUserInvestments(userId),
            this.ordersService.findByWalletAddress(wallet),
            this.commissionsService.findByWallet(wallet),
            this.withdrawalsService.getUserWithdrawals(userId, wallet),
            user.referredById != null ? this.usersService.findOne(user.referredById) : Promise.resolve(null),
            this.usersService.countReferrals(userId),
        ]);

        return {
            user,
            payouts,
            investments,
            orders,
            commissions,
            withdrawals,
            referrer: referrer ? { id: referrer.id, name: referrer.name, referralCode: referrer.referralCode } : null,
            totalReferred,
        };
    }
}
