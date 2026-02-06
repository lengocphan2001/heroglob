import { Controller, Post, Get, Body, UseGuards, Req, ForbiddenException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayoutService } from './payout.service';

@Controller('payouts')
@UseGuards(AuthGuard('jwt'))
export class PayoutController {
    private readonly logger = new Logger(PayoutController.name);

    constructor(private readonly payoutService: PayoutService) { }

    @Get('pending')
    async getPendingPayouts(@Req() req) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only administrators can view pending payouts.');
        }

        return await this.payoutService.getPendingPayouts();
    }

    @Post('trigger')
    async triggerPayout(@Req() req, @Body() body: { selectedRewards?: any[] }) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only administrators can trigger payouts manually.');
        }

        this.logger.log(`Manual payout triggered by admin: ${req.user.email}`);
        if (body.selectedRewards) {
            this.logger.log(`Selected rewards count: ${body.selectedRewards.length}`);
        }

        // This is a long-running process, but we'll wait for it to finish 
        // to give feedback to the admin.
        try {
            await this.payoutService.processDailyPayouts(body.selectedRewards);
            return {
                success: true,
                message: body.selectedRewards
                    ? `Processed ${body.selectedRewards.length} selected payouts.`
                    : 'Daily payouts processed successfully.'
            };
        } catch (error) {
            this.logger.error('Failed to process manual payout:', error);
            return {
                success: false,
                message: 'Failed to process manual payout. Check server logs.'
            };
        }
    }
}
