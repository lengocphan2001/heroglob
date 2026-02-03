import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { IsNotEmpty, IsString } from 'class-validator';

class RegisterDto {
  @IsString()
  @IsNotEmpty()
  walletAddress!: string;

  @IsString()
  @IsNotEmpty()
  refCode!: string;
}

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) { }

  @Get('code')
  getCode(@Query('walletAddress') walletAddress: string) {
    if (!walletAddress?.trim()) return { code: null };
    return this.referralsService.getOrCreateCode(walletAddress);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.referralsService.registerReferral(dto.walletAddress, dto.refCode);
  }

  @Get('stats')
  getStats(@Query('walletAddress') walletAddress: string) {
    if (!walletAddress?.trim()) return { totalReferred: 0 };
    return this.referralsService.getStats(walletAddress);
  }
}
