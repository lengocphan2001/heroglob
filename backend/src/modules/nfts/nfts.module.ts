import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTsController } from './nfts.controller';
import { NFTsService } from './nfts.service';
import { NFTRewardsService } from './nft-rewards.service';
import { NFT } from './entities/nft.entity';
import { NFTReward } from './entities/nft-reward.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PayoutModule } from '../payouts/payout.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([NFT, NFTReward, Product, User]),
        forwardRef(() => PayoutModule),
    ],
    controllers: [NFTsController],
    providers: [NFTsService, NFTRewardsService],
    exports: [NFTsService, NFTRewardsService],
})
export class NFTsModule { }
