import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { StatsModule } from './modules/stats/stats.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { RanksModule } from './modules/ranks/ranks.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { NFTsModule } from './modules/nfts/nfts.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        autoLoadEntities: true,
        synchronize: config.get('database.synchronize'),
        logging: config.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    ReferralsModule,
    CategoriesModule,
    StatsModule,
    SystemConfigModule,
    InvestmentsModule,
    RanksModule,
    TransactionsModule,
    NFTsModule,
    WithdrawalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
