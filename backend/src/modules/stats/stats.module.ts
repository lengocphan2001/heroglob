import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [OrdersModule, UsersModule],
    controllers: [StatsController],
    providers: [StatsService],
})
export class StatsModule { }
