import { Controller, Get, Req, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NFTsService } from './nfts.service';

@Controller('nfts')
export class NFTsController {
    constructor(private readonly nftsService: NFTsService) { }

    @Get('my-nfts')
    @UseGuards(AuthGuard('jwt'))
    async getMyNFTs(@Req() req: any) {
        return this.nftsService.getUserNFTs(req.user.id, req.user.walletAddress);
    }

    @Get()
    async getNfts(@Query('walletAddress') walletAddress: string) {
        if (!walletAddress) {
            throw new BadRequestException('Wallet address is required');
        }
        return this.nftsService.getUserNFTs(0, walletAddress); // Use 0 instead of null for userId if it expects a number, or null if allowed.
    }
}
