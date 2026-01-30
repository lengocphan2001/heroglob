import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Order } from '../orders/entities/order.entity';
import { Commission } from '../commissions/entities/commission.entity';
import { Payout } from '../investments/entities/payout.entity';
import { NFTReward } from '../nfts/entities/nft-reward.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Commission, Payout, NFTReward])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule { }
