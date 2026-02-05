import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { Investment } from './entities/investment.entity';
import { Payout } from './entities/payout.entity';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UsersModule } from '../users/users.module';
import { ActivePowerModule } from '../active-power/active-power.module';
import { PayoutModule } from '../payouts/payout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, Payout]),
    SystemConfigModule,
    UsersModule,
    ActivePowerModule,
    forwardRef(() => PayoutModule),
  ],
  providers: [InvestmentsService],
  controllers: [InvestmentsController],
  exports: [InvestmentsService],
})
export class InvestmentsModule { }
