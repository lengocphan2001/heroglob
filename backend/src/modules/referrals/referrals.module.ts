import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCode } from './entities/referral-code.entity';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { ReferralsService } from './referrals.service';
import { Action } from 'rxjs/internal/scheduler/Action';
import { UsersModule } from '../users/users.module';
import { RewardsService } from './rewards.service';
import { ReferralsController } from './referrals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralCode, Referral, User]),
    UsersModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService, RewardsService],
  exports: [ReferralsService],
})
export class ReferralsModule { }
