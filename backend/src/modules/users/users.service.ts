import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;
const SEED_EMAIL = 'admin@heroglob.com';
const SEED_PASSWORD = 'Admin@123';

export type AdminUser = {
  id: string;
  email: string | null;
  name: string;
  role: string;
  passwordHash: string | null;
};

function toAdminUser(entity: User): AdminUser {
  return {
    id: String(entity.id),
    email: entity.email,
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
  ) { }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const normalized = walletAddress.trim().toLowerCase();
    return this.userRepo.findOne({ where: { walletAddress: normalized } });
  }

  async findByWallet(walletAddress: string): Promise<User | null> {
    return this.findByWalletAddress(walletAddress);
  }

  /**
   * Find user by wallet, or create one with minimal info (e.g. when order is placed before registration).
   * Used so product-order payouts can always be scheduled.
   */
  async findOrCreateByWallet(walletAddress: string): Promise<User> {
    const existing = await this.findByWalletAddress(walletAddress);
    if (existing) return existing;
    return this.createWithWallet(walletAddress.trim());
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

    let referredById: number | null = null;
    if (referrerCode) {
      const referrer = await this.userRepo.findOne({ where: { referralCode: referrerCode.trim() } });
      if (referrer) {
        referredById = referrer.id;
      }
    }

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

    let referredById: number | null = null;
    if (data.referrerCode) {
      const referrer = await this.userRepo.findOne({ where: { referralCode: data.referrerCode } });
      if (referrer) {
        referredById = referrer.id;
      }
    }

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

  async onModuleInit() {
    const existing = await this.userRepo.findOne({
      where: { email: SEED_EMAIL.toLowerCase() },
    });
    if (!existing) {
      const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
      await this.userRepo.insert({
        email: SEED_EMAIL.toLowerCase(),
        name: 'Admin',
        role: 'admin',
        passwordHash: hash,
      });
    }
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

  async findOne(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  /** Credit or debit in-app token (HERO) balance. */
  async updateBalance(id: number, change: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) return;
    user.heroBalance = Number(user.heroBalance) + change;
    await this.userRepo.save(user);
  }

  /** Credit or debit in-app USDT balance. */
  async updateUsdtBalance(id: number, change: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) return;
    user.usdtBalance = Number(user.usdtBalance) + change;
    await this.userRepo.save(user);
  }
}
