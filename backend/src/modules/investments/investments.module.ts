import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { Investment } from './entities/investment.entity';
import { Payout } from './entities/payout.entity';
import { Order } from '../orders/entities/order.entity';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UsersModule } from '../users/users.module';
import { ActivePowerModule } from '../active-power/active-power.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, Payout, Order]),
    SystemConfigModule,
    UsersModule,
    ActivePowerModule,
    ReferralsModule,
    CommissionsModule,
  ],
  providers: [InvestmentsService],
  controllers: [InvestmentsController],
  exports: [InvestmentsService],
})
export class InvestmentsModule { }
