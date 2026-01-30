import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RanksService } from './ranks.service';

@Controller('ranks')
export class RanksController {
    constructor(private readonly ranksService: RanksService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('stats')
    async getStats(@Req() req) {
        return this.ranksService.getRankStats(req.user.id);
    }
}
