import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ReferralCode } from './entities/referral-code.entity';
import { Referral } from './entities/referral.entity';
import { UsersService } from '../users/users.service';

function generateCode(): string {
  return randomBytes(5).toString('base64url').slice(0, 8).replace(/[-_]/g, 'x');
}

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralCode)
    private readonly codeRepo: Repository<ReferralCode>,
    @InjectRepository(Referral)
    private readonly referralRepo: Repository<Referral>,
    private readonly usersService: UsersService,
  ) { }

  private async ensureCode(code: string): Promise<string> {
    const exists = await this.codeRepo.findOne({ where: { code } });
    if (exists) return code;
    let c = code;
    for (let i = 0; i < 10; i++) {
      c = generateCode();
      const found = await this.codeRepo.findOne({ where: { code: c } });
      if (!found) return c;
    }
    return randomBytes(8).toString('base64url').slice(0, 12);
  }

  /** Returns the same referral code as in users.referral_code (admin "Mã giới thiệu"). */
  async getOrCreateCode(walletAddress: string): Promise<{ code: string }> {
    const normalized = walletAddress.trim().toLowerCase();

    // Prefer the user's referral code from users table (single source of truth with admin)
    const user = await this.usersService.findByWalletAddress(walletAddress);
    if (user?.referralCode?.trim()) {
      const userCode = user.referralCode.trim();
      let row = await this.codeRepo.findOne({ where: { walletAddress: normalized } });
      if (row) {
        if (row.code !== userCode) {
          row.code = userCode;
          await this.codeRepo.save(row);
        }
        return { code: row.code };
      }
      row = this.codeRepo.create({ walletAddress: normalized, code: userCode });
      await this.codeRepo.save(row);
      return { code: userCode };
    }

    // Fallback: no user or no referralCode – use referral_codes table only
    let row = await this.codeRepo.findOne({ where: { walletAddress: normalized } });
    if (row) return { code: row.code };
    const code = await this.ensureCode(generateCode());
    row = this.codeRepo.create({ walletAddress: normalized, code });
    await this.codeRepo.save(row);
    return { code: row.code };
  }

  async registerReferral(referredWallet: string, refCode: string): Promise<{ ok: boolean; message?: string }> {
    if (!referredWallet || !refCode?.trim()) return { ok: false, message: 'Dữ liệu không hợp lệ' };
    const referred = referredWallet.trim().toLowerCase();
    const code = refCode.trim().toUpperCase();
    let referrerWallet: string | null = null;
    const codeRow = await this.codeRepo.findOne({ where: { code } });
    if (codeRow) {
      referrerWallet = codeRow.walletAddress;
    } else {
      const referrerUser = await this.usersService.findByReferralCode(code);
      if (referrerUser?.walletAddress) {
        referrerWallet = referrerUser.walletAddress.trim().toLowerCase();
        const existingRow = await this.codeRepo.findOne({ where: { walletAddress: referrerWallet } });
        if (existingRow) {
          existingRow.code = code;
          await this.codeRepo.save(existingRow);
        } else {
          const row = this.codeRepo.create({ walletAddress: referrerWallet, code });
          await this.codeRepo.save(row);
        }
      }
    }
    if (!referrerWallet) return { ok: false, message: 'Mã giới thiệu không hợp lệ' };
    if (referrerWallet === referred) return { ok: false, message: 'Không thể dùng mã của chính mình' };
    const existing = await this.referralRepo.findOne({ where: { referredWallet: referred } });
    if (existing) return { ok: true, message: 'Đã được ghi nhận trước đó' };
    const referral = this.referralRepo.create({ referrerWallet, referredWallet: referred });
    await this.referralRepo.save(referral);
    return { ok: true };
  }

  /** Stats from users.referred_by_id (source of truth). */
  async getStats(walletAddress: string): Promise<{ totalReferrals: number; totalEarnings: number }> {
    const wallet = walletAddress.trim().toLowerCase();
    const user = await this.usersService.findByWalletAddress(wallet);
    if (!user) return { totalReferrals: 0, totalEarnings: 0 };
    const totalReferrals = await this.usersService.countReferrals(user.id);
    return { totalReferrals, totalEarnings: 0 };
  }

  /** List referred users from users table (referred_by_id = current user). */
  async getList(walletAddress: string): Promise<{ id: number; referredWallet: string; createdAt: string; totalSpent: number }[]> {
    const wallet = walletAddress.trim().toLowerCase();
    const user = await this.usersService.findByWalletAddress(wallet);
    if (!user) return [];
    const referred = await this.usersService.findReferredByUserId(user.id);
    return referred
      .filter(u => u.walletAddress)
      .map(u => ({
        id: u.id,
        referredWallet: u.walletAddress!,
        createdAt: u.createdAt.toISOString(),
        totalSpent: 0,
      }));
  }

  async getCodeByWallet(walletAddress: string): Promise<string | null> {
    const row = await this.codeRepo.findOne({
      where: { walletAddress: walletAddress.trim().toLowerCase() },
    });
    return row?.code ?? null;
  }

  async getReferrer(walletAddress: string): Promise<string | null> {
    const referral = await this.referralRepo.findOne({
      where: { referredWallet: walletAddress.trim().toLowerCase() },
    });
    return referral?.referrerWallet ?? null;
  }
}
