import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CommissionsService } from './commissions.service';

type UserRequest = Request & { user: { walletAddress: string; role: string } };

@Controller('commissions')
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getMyCommissions(@Req() req: UserRequest) {
        return this.commissionsService.findByWallet(req.user.walletAddress);
    }

    @Get('stats')
    @UseGuards(AuthGuard('jwt'))
    async getMyStats(@Req() req: UserRequest) {
        return this.commissionsService.getStats(req.user.walletAddress);
    }

    @Get('admin/all')
    @UseGuards(AuthGuard('jwt'))
    async getAllCommissions(@Req() req: UserRequest) {
        // strict check for admin role
        if (req.user.role !== 'admin') {
            // Just return empty or error for now, better to implement a RolesGuard later
            // But for quick impl:
            return { error: 'Unauthorized' };
        }
        return this.commissionsService.findAll();
    }
}
