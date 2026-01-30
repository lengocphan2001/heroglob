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
import { CommissionsModule } from './modules/commissions/commissions.module';
import { StatsModule } from './modules/stats/stats.module';

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
    ReferralsModule,
    CategoriesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
