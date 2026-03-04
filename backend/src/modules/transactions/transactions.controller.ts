import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Req() req) {
        const user = req.user;
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const walletAddress = user.walletAddress ?? null;
        return this.transactionsService.getUserHistory(userId, walletAddress);
    }
}
