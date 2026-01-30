import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IsOptional, IsString } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { JwtUser } from './strategies/jwt.strategy';

type LocalUser = { id: string; email: string; name: string; role: string };

export class LoginWalletDto {
  @IsString()
  address!: string;

  @IsString()
  @IsOptional()
  refCode?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request & { user: LocalUser }, @Body() _body: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('login-wallet')
  async loginWallet(@Body() body: LoginWalletDto) {
    return this.authService.loginWallet(body.address, body.refCode);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request & { user: JwtUser }) {
    return { user: req.user };
  }
}