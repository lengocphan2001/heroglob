import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { WalletController } from './wallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, WalletController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
