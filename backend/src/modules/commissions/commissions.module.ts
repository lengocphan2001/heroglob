import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from './entities/commission.entity';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Commission]), UsersModule],
    controllers: [CommissionsController],
    providers: [CommissionsService],
    exports: [CommissionsService],
})
export class CommissionsModule { }
