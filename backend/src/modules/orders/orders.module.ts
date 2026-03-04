import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ReferralsModule } from '../referrals/referrals.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { NFTsModule } from '../nfts/nfts.module';
import { UsersModule } from '../users/users.module';
import { InvestmentsModule } from '../investments/investments.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ReferralsModule,
    CommissionsModule,
    NFTsModule,
    UsersModule,
    InvestmentsModule,
    SystemConfigModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }
