import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stats')
// @UseGuards(JwtAuthGuard, RolesGuard) // Optional: secure this endpoint
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('dashboard')
    // @Roles('admin')
    async getDashboardStats() {
        return this.statsService.getDashboardStats();
    }
}
