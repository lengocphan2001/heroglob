import { forwardRef, Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { PayoutScheduler } from './payout.scheduler';
import { RanksModule } from '../ranks/ranks.module';
import { InvestmentsModule } from '../investments/investments.module';
import { NFTsModule } from '../nfts/nfts.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UsersModule } from '../users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from '../investments/entities/payout.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payout, User]),
        forwardRef(() => RanksModule),
        forwardRef(() => InvestmentsModule),
        forwardRef(() => NFTsModule),
        SystemConfigModule,
        UsersModule,
    ],
    controllers: [PayoutController],
    providers: [PayoutService, PayoutScheduler],
    exports: [PayoutService],
})
export class PayoutModule { }
