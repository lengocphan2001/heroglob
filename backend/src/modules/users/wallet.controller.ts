import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('wallet')
export class WalletController {
    constructor(private readonly usersService: UsersService) { }

    @Get('balance')
    async getBalance(@Query('walletAddress') walletAddress: string) {
        if (!walletAddress) {
            throw new BadRequestException('Wallet address is required');
        }
        const user = await this.usersService.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                heroBalance: 0,
                usdtBalance: 0,
                ethBalance: 0,
                usdValue: 0
            };
        }
        return {
            heroBalance: Number(user.heroBalance || 0),
            usdtBalance: Number(user.usdtBalance || 0),
            ethBalance: 0, // Placeholder
            usdValue: 0    // Placeholder - would need price feed
        };
    }
}
