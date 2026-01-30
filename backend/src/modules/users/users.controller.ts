import { Controller, Get, UseGuards, Req } from '@nestjs/common';
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
}
