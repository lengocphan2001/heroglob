import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { InvestmentsModule } from '../investments/investments.module';
import { OrdersModule } from '../orders/orders.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';

@Module({
    imports: [
        UsersModule,
        InvestmentsModule,
        OrdersModule,
        CommissionsModule,
        WithdrawalsModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
