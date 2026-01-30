import { Body, Controller, Get, Post } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';

@Controller('system-config')
export class SystemConfigController {
    constructor(private readonly systemConfigService: SystemConfigService) { }

    @Get()
    getAll() {
        return this.systemConfigService.getAll();
    }

    @Post()
    update(@Body() body: { key: string; value: string }) {
        return this.systemConfigService.set(body.key, body.value);
    }
}
