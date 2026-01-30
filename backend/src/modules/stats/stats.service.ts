import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly usersService: UsersService,
    ) { }

    async getDashboardStats() {
        const orders = await this.ordersService.findAll();
        const users = await this.usersService.findAll();

        // Calculate revenue
        let totalRevenueUSDT = 0;
        let totalRevenueHERO = 0;

        orders.forEach(o => {
            if (o.status === 'completed') {
                const amount = parseFloat(o.amount);
                if (o.tokenType === 'usdt') {
                    totalRevenueUSDT += amount;
                } else {
                    totalRevenueHERO += amount;
                }
            }
        });

        // Simple growth calculation (mock or real if we have dates)
        // For now, let's just return totals. 
        // Real implementation would filter by date.

        // Recent orders
        const recentOrders = orders.slice(0, 5).map(o => ({
            id: o.id,
            customer: o.walletAddress, // Or map to generic name if available
            amount: `${o.amount} ${o.tokenType.toUpperCase()}`,
            status: o.status,
            createdAt: o.createdAt
        }));

        return {
            revenue: {
                usdt: totalRevenueUSDT,
                hero: totalRevenueHERO,
                formatted: `${totalRevenueUSDT.toLocaleString()} USDT` // Simplified
            },
            users: {
                total: users.length,
                growth: '+5%' // Mock
            },
            orders: {
                total: orders.length,
                growth: '+2%' // Mock
            },
            recentOrders
        };
    }
}
