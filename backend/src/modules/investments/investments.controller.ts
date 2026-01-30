import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvestmentsService } from './investments.service';

@Controller('investments')
export class InvestmentsController {
    constructor(private readonly investmentsService: InvestmentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('activate')
    activate(@Req() req, @Body() body: { amount: number }) {
        const userId = parseInt(req.user.id, 10);
        return this.investmentsService.activatePower(userId, body.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('payouts')
    getPayouts() {
        return this.investmentsService.getAllPayouts();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-payouts')
    getMyPayouts(@Req() req) {
        const userId = parseInt(req.user.id, 10);
        return this.investmentsService.getUserPayouts(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    getUserInvestments(@Req() req) {
        const userId = parseInt(req.user.id, 10);
        return this.investmentsService.getUserInvestments(userId);
    }
}
