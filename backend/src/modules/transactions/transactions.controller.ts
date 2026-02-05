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
        return this.transactionsService.getUserHistory(Number(user.id), user.walletAddress);
    }
}
