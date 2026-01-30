import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
