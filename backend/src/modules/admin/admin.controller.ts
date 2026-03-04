import { Controller, Get, Param, Req, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users/:id/detail')
    async getUserDetail(@Param('id') id: string, @Req() req: any) {
        if (req.user?.role !== 'admin') {
            throw new ForbiddenException('Admin only');
        }
        const userId = parseInt(id, 10);
        if (Number.isNaN(userId)) throw new BadRequestException('Invalid user id');
        return this.adminService.getUserDetail(userId);
    }
}
