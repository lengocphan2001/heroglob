import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
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
            return { error: 'Unauthorized' };
        }
        return this.commissionsService.findAll();
    }

    @Get('admin/user/:wallet')
    @UseGuards(AuthGuard('jwt'))
    async getByWallet(@Req() req: UserRequest, @Param('wallet') wallet: string) {
        if (req.user.role !== 'admin') {
            return { error: 'Unauthorized' };
        }
        return this.commissionsService.findByWallet(wallet);
    }
}
