import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('balance')
    async getBalance(@Req() req) {
        const user = await this.usersService.findOne(req.user.id);
        if (!user) {
            return { heroBalance: 0, usdtBalance: 0 };
        }
        return {
            heroBalance: Number(user.heroBalance),
            usdtBalance: Number(user.usdtBalance),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(Number(id));
        if (!user) return null;

        const referralCount = await this.usersService.countReferrals(user.id);
        const referrals = await this.usersService.findAllReferrals(user.id);

        let referrerData: any = null;
        if (user.referredById) {
            const r = await this.usersService.findOne(user.referredById);
            if (r) {
                referrerData = { id: r.id, name: r.name };
            }
        }

        return {
            ...user,
            referralCount,
            referrals,
            referrer: referrerData,
        };
    }
}
