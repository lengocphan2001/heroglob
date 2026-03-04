import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';

@Injectable()
export class SystemConfigService implements OnModuleInit {
    constructor(
        @InjectRepository(SystemConfig)
        private configRepository: Repository<SystemConfig>,
    ) { }

    async onModuleInit() {
        // Seed default values
        const defaults = {
            PROJECT_NAME: 'HeroGlob',
            PROJECT_DESCRIPTION: 'Metaverse & NFTs',
            INVESTMENT_MIN_USDT: '10',
            INVESTMENT_PROFIT_PERCENT: '1', // 1%
            PROJECT_TOKEN_NAME: 'Hero Coin',
            PROJECT_TOKEN_SYMBOL: 'HERO',
            PROJECT_TOKEN_ADDRESS: process.env.PROJECT_TOKEN_ADDRESS || '',
            PAYMENT_RECEIVER_ADDRESS: process.env.PAYMENT_RECEIVER_ADDRESS || '',
            // Payout time (UTC): hour 0 = midnight, minute 0
            PAYOUT_UTC_HOUR: '0',
            PAYOUT_UTC_MINUTE: '0',
            // Product purchase: daily payout for N days, daily percent of order amount
            PRODUCT_PURCHASE_PAYOUT_DAYS: '30',
            PRODUCT_PURCHASE_DAILY_PERCENT: '0.1',
        };

        for (const [key, value] of Object.entries(defaults)) {
            const exists = await this.configRepository.findOne({ where: { key } });
            if (!exists) {
                await this.configRepository.save({ key, value });
            }
        }
    }

    async get(key: string, defaultValue?: string): Promise<string> {
        const config = await this.configRepository.findOne({ where: { key } });
        if (config) return config.value;
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`Config key ${key} not found`);
    }

    async set(key: string, value: string): Promise<SystemConfig> {
        let config = await this.configRepository.findOne({ where: { key } });
        if (config) {
            config.value = value;
        } else {
            config = this.configRepository.create({ key, value });
        }
        return this.configRepository.save(config);
    }

    async getAll(): Promise<SystemConfig[]> {
        return this.configRepository.find();
    }
}
