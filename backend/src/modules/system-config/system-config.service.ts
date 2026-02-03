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
            INVESTMENT_MIN_USDT: '10',
            INVESTMENT_PROFIT_PERCENT: '1', // 1%
            PROJECT_NAME: 'Hero Global',
            PROJECT_LOGO: '',
            PROJECT_TOKEN_NAME: 'Hero Coin',
            PROJECT_TOKEN_SYMBOL: 'HERO',
            PAYMENT_RECEIVER_ADDRESS: process.env.PAYMENT_RECEIVER_ADDRESS || '',
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
