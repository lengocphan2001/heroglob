import { Body, Controller, Get, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WithdrawalsService } from './withdrawals.service';

@Controller('withdrawals')
export class WithdrawalsController {
    constructor(private readonly withdrawalsService: WithdrawalsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createWithdrawal(
        @Req() req: any,
        @Body() body: { toAddress: string; amount: number; tokenType: 'usdt' | 'hero' },
    ) {
        return this.withdrawalsService.createWithdrawal(
            req.user.id,
            req.user.walletAddress,
            body.toAddress,
            body.amount,
            body.tokenType,
        );
    }

    @Get('my-withdrawals')
    @UseGuards(AuthGuard('jwt'))
    async getMyWithdrawals(@Req() req: any) {
        return this.withdrawalsService.getUserWithdrawals(req.user.id, req.user.walletAddress);
    }

    @Get('admin/all')
    @UseGuards(AuthGuard('jwt'))
    async getAllWithdrawals(@Req() req: any) {
        if (req.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }
        return this.withdrawalsService.getAllWithdrawals();
    }

    @Patch('admin/status')
    @UseGuards(AuthGuard('jwt'))
    async updateStatus(
        @Req() req: any,
        @Body() body: { id: number; status: string; txHash?: string; rejectReason?: string },
    ) {
        if (req.user?.role !== 'admin') {
            return { error: 'Unauthorized' };
        }
        return this.withdrawalsService.updateStatus(
            body.id,
            body.status as any,
            body.txHash,
            body.rejectReason,
        );
    }
}
