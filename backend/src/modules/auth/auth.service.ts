import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ReferralsService } from '../referrals/referrals.service';

export type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly referralsService: ReferralsService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await this.usersService.validatePassword(user, password))) {
      return null;
    }
    return this.usersService.toPublic(user);
  }

  async login(user: { id: string; email: string; name: string; role: string }) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async loginWallet(address: string, refCode?: string) {
    let user = await this.usersService.findByWalletAddress(address);
    if (!user) {
      user = await this.usersService.createWithWallet(address);
    }
    if (refCode && user.walletAddress) {
      await this.referralsService.registerReferral(user.walletAddress, refCode);
    }
    const payload: JwtPayload = { sub: String(user.id), email: user.email ?? '' };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    return this.usersService.toPublic(user);
  }
}
