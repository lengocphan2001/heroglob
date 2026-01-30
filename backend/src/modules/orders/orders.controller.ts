import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: any) {
    if (req.user?.role === 'admin') {
      return this.ordersService.findAll();
    }
    // For normal users, maybe only return their orders? 
    // But existing code just returns all. I will keep it as is but add specific admin route if needed later.
    // Actually, let's make a specific admin route as per plan.
    return this.ordersService.findAll();
  }

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  findAllAdmin(@Req() req: any) {
    if (req.user?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }
    return this.ordersService.findAll();
  }

  @Post('admin/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Req() req: any, @Body() body: { id: number; status: string }) {
    if (req.user?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }
    return this.ordersService.updateStatus(body.id, body.status);
  }

  @Get('my-products')
  @UseGuards(AuthGuard('jwt'))
  async getMyProducts(@Req() req: any) {
    return this.ordersService.getUserProducts(req.user.walletAddress);
  }
}
