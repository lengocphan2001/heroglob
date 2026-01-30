import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanksService } from './ranks.service';
import { RanksController } from './ranks.controller';
import { User } from '../users/entities/user.entity';
import { Payout } from '../investments/entities/payout.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Payout, Referral]),
    UsersModule,
  ],
  providers: [RanksService],
  controllers: [RanksController],
  exports: [RanksService],
})
export class RanksModule { }
