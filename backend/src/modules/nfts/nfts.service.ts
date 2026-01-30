import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFT } from './entities/nft.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class NFTsService {
    constructor(
        @InjectRepository(NFT)
        private nftRepo: Repository<NFT>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
    ) { }

    async createNFT(userId: number, walletAddress: string, productId: number, orderId?: number) {
        const nft = this.nftRepo.create({
            userId,
            walletAddress: walletAddress.toLowerCase(),
            productId,
            orderId: orderId || null,
        });
        return this.nftRepo.save(nft);
    }

    async getUserNFTs(userId: number, walletAddress: string) {
        const nfts = await this.nftRepo.find({
            where: [
                { userId },
                { walletAddress: walletAddress?.toLowerCase() },
            ],
            order: { createdAt: 'DESC' },
        });

        // Group by product and count quantities
        const productMap = new Map<number, any>();

        for (const nft of nfts) {
            const productId = nft.productId;
            if (productMap.has(productId)) {
                const existing = productMap.get(productId);
                existing.quantity += 1;
                existing.nftIds.push(nft.id);
            } else {
                productMap.set(productId, {
                    productId,
                    quantity: 1,
                    nftIds: [nft.id],
                    lastPurchased: nft.createdAt,
                });
            }
        }

        // Fetch product details
        const productIds = Array.from(productMap.keys());
        if (productIds.length === 0) {
            return [];
        }

        const products = await this.productRepo.findByIds(productIds);
        const productDetailsMap = new Map(products.map((p) => [p.id, p]));

        // Combine NFT data with product details
        const result: any[] = [];
        for (const [productId, nftData] of productMap.entries()) {
            const product = productDetailsMap.get(productId);
            if (product) {
                result.push({
                    productId: product.id,
                    hashId: product.hashId,
                    title: product.title,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    creatorHandle: product.creatorHandle,
                    creatorAvatarUrl: product.creatorAvatarUrl,
                    quantity: nftData.quantity,
                    nftIds: nftData.nftIds,
                    lastPurchased: nftData.lastPurchased,
                });
            }
        }

        return result;
    }
}
