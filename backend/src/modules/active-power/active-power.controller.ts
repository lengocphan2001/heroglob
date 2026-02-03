import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivePowerService } from './active-power.service';
import { ActivePowerPackage } from './entities/active-power-package.entity';

@Controller('active-power')
export class ActivePowerController {
    constructor(private readonly service: ActivePowerService) { }

    @Get()
    findAllPublic() {
        return this.service.findActive();
    }

    @Get('admin')
    @UseGuards(AuthGuard('jwt'))
    findAllAdmin() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() body: Partial<ActivePowerPackage>) {
        return this.service.create(body);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() body: Partial<ActivePowerPackage>) {
        return this.service.update(+id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
