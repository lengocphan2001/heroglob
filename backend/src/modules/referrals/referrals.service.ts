import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ReferralCode } from './entities/referral-code.entity';
import { Referral } from './entities/referral.entity';

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

  async getOrCreateCode(walletAddress: string): Promise<{ code: string }> {
    const normalized = walletAddress.trim().toLowerCase();
    let row = await this.codeRepo.findOne({ where: { walletAddress: normalized } });
    if (row) return { code: row.code };
    const code = await this.ensureCode(generateCode());
    row = this.codeRepo.create({ walletAddress: normalized, code });
    await this.codeRepo.save(row);
    return { code: row.code };
  }

  async registerReferral(referredWallet: string, refCode: string): Promise<{ ok: boolean; message?: string }> {
    if (!referredWallet || !refCode) return { ok: false, message: 'Dữ liệu không hợp lệ' };
    const referred = referredWallet.trim().toLowerCase();
    const code = refCode.trim();
    const codeRow = await this.codeRepo.findOne({ where: { code } });
    if (!codeRow) return { ok: false, message: 'Mã giới thiệu không hợp lệ' };
    const referrer = codeRow.walletAddress;
    if (referrer === referred) return { ok: false, message: 'Không thể dùng mã của chính mình' };
    const existing = await this.referralRepo.findOne({ where: { referredWallet: referred } });
    if (existing) return { ok: true, message: 'Đã được ghi nhận trước đó' };
    const referral = this.referralRepo.create({ referrerWallet: referrer, referredWallet: referred });
    await this.referralRepo.save(referral);
    return { ok: true };
  }

  async getStats(walletAddress: string): Promise<{ totalReferred: number }> {
    const wallet = walletAddress.trim().toLowerCase();
    const totalReferred = await this.referralRepo.count({ where: { referrerWallet: wallet } });
    return { totalReferred };
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
