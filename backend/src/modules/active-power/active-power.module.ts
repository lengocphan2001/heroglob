import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivePowerController } from './active-power.controller';
import { ActivePowerService } from './active-power.service';
import { ActivePowerPackage } from './entities/active-power-package.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ActivePowerPackage])],
    controllers: [ActivePowerController],
    providers: [ActivePowerService],
    exports: [ActivePowerService],
})
export class ActivePowerModule { }
