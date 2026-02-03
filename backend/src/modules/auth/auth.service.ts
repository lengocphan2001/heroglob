import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const user = await this.usersService.findByWalletAddress(address);
    if (!user) {
      throw new NotFoundException('Wallet not registered');
    }
    // Update refCode if provided and not set? usually refCode is set on creation.
    // If user exists, we just login.

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

  async registerWallet(address: string, refCode?: string, name?: string, email?: string) {
    // Check existing
    const existing = await this.usersService.findByWalletAddress(address);
    if (existing) {
      throw new BadRequestException('Wallet already registered');
    }

    // Check RefCode Requirement
    if (!refCode) {
      const count = await this.usersService.countUsers();
      if (count > 1) {
        throw new BadRequestException('Referral code is required');
      }
    }

    const user = await this.usersService.createWithWallet(address, refCode, name, email);
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

  async register(data: { email: string; password: string; name: string; refCode?: string }) {
    const user = await this.usersService.createWithEmail({
      email: data.email,
      password: data.password,
      name: data.name,
      referrerCode: data.refCode,
    });
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
