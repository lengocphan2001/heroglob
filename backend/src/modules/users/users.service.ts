import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { ReferralCode } from '../referrals/entities/referral-code.entity';

const SALT_ROUNDS = 10;

export type AdminUser = {
  id: string;
  email: string | null;
  walletAddress: string | null;
  name: string;
  role: string;
  passwordHash: string | null;
};

function toAdminUser(entity: User): AdminUser {
  return {
    id: String(entity.id),
    email: entity.email,
    walletAddress: entity.walletAddress,
    name: entity.name,
    role: entity.role,
    passwordHash: entity.passwordHash,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ReferralCode)
    private readonly codeRepo: Repository<ReferralCode>,
  ) { }

  private async findReferrerId(code: string): Promise<number | null> {
    const trimmed = code?.trim();
    if (!trimmed) return null;

    // 1. Try finding in Users table (referralCode column)
    const upperCode = trimmed.toUpperCase();
    const userByCode = await this.userRepo.findOne({ where: { referralCode: upperCode } });
    if (userByCode) return userByCode.id;

    // 2. Fallback: Try finding in ReferralCodes table
    const codeRow = await this.codeRepo.findOne({ where: { code: trimmed } });
    if (codeRow) {
      const userByWallet = await this.userRepo.findOne({
        where: { walletAddress: codeRow.walletAddress.toLowerCase() }
      });
      if (userByWallet) return userByWallet.id;
    }

    return null;
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const normalized = walletAddress.trim().toLowerCase();
    return this.userRepo.findOne({ where: { walletAddress: normalized } });
  }

  async findByWallet(walletAddress: string): Promise<User | null> {
    return this.findByWalletAddress(walletAddress);
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createWithWallet(
    walletAddress: string,
    referrerCode?: string,
    name?: string,
    email?: string,
  ): Promise<User> {
    const normalized = walletAddress.trim().toLowerCase();

    const referredById = referrerCode ? await this.findReferrerId(referrerCode) : null;

    const displayName = (name && name.trim()) || `User ${normalized.slice(0, 6)}`;
    const emailVal = email && email.trim() ? email.trim().toLowerCase() : null;

    const user = this.userRepo.create({
      walletAddress: normalized,
      name: displayName,
      role: 'user',
      heroBalance: 0,
      email: emailVal,
      passwordHash: null,
      referralCode: this.generateReferralCode(),
      referredById,
      rank: 'member',
    });
    return this.userRepo.save(user);
  }

  async createWithEmail(data: { email: string; password: string; name: string; referrerCode?: string }): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) throw new Error('Email đã tồn tại');

    const referredById = data.referrerCode ? await this.findReferrerId(data.referrerCode) : null;

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      email: normalizedEmail,
      walletAddress: null,
      name: data.name,
      role: 'user',
      heroBalance: 0,
      usdtBalance: 0,
      passwordHash,
      referralCode: this.generateReferralCode(),
      referredById,
      rank: 'member',
    });
    return this.userRepo.save(user);
  }

  async countReferrals(userId: number): Promise<number> {
    return this.userRepo.count({ where: { referredById: userId } });
  }

  async countUsers(): Promise<number> {
    return this.userRepo.count();
  }


  async findByEmail(email: string): Promise<AdminUser | undefined> {
    const normalized = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    return user ? toAdminUser(user) : undefined;
  }

  async findById(id: string): Promise<AdminUser | undefined> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return undefined;
    const user = await this.userRepo.findOne({ where: { id: numId } });
    return user ? toAdminUser(user) : undefined;
  }

  async validatePassword(user: AdminUser, password: string): Promise<boolean> {
    if (!user.passwordHash) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  toPublic(user: AdminUser) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async findAll() {
    return this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllReferrals(userId: number) {
    return this.userRepo.find({
      where: { referredById: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateBalance(id: number, change: number): Promise<void> {
    // Basic implementation; for production consider transactions or query builder increment
    const user = await this.findOne(id);
    if (!user) return;
    // ensure floating point math is handled reasonably well, or rely on JS number (double precision)
    // heroBalance is string in entity? No, it's number (decimal).
    // TypeORM returns decimal columns as strings usually, but entity defined as number.
    // Let's assume number.
    user.heroBalance = Number(user.heroBalance) + change;
    await this.userRepo.save(user);
  }
}
