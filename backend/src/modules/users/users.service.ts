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
  email: string;
  name: string;
  role: string;
  passwordHash: string;
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
  ) {}

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
    return bcrypt.compare(password, user.passwordHash);
  }

  toPublic(user: AdminUser) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
