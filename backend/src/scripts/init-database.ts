import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

// Import all entities
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { NFT } from '../modules/nfts/entities/nft.entity';
import { NFTReward } from '../modules/nfts/entities/nft-reward.entity';
import { Investment } from '../modules/investments/entities/investment.entity';
import { Payout } from '../modules/investments/entities/payout.entity';
import { ReferralCode } from '../modules/referrals/entities/referral-code.entity';
import { Referral } from '../modules/referrals/entities/referral.entity';
import { Commission } from '../modules/commissions/entities/commission.entity';
import { SystemConfig } from '../modules/system-config/entities/system-config.entity';
import { Withdrawal } from '../modules/withdrawals/entities/withdrawal.entity';

async function bootstrap() {
    console.log('🚀 Starting database initialization...');

    // Create standalone DataSource
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'heroglob',
        entities: [
            User,
            Category,
            Product,
            Order,
            NFT,
            NFTReward,
            Investment,
            Payout,
            ReferralCode,
            Referral,
            Commission,
            SystemConfig,
            Withdrawal,
        ],
        synchronize: false,
        logging: false,
    });

    try {
        // Initialize connection
        await dataSource.initialize();
        console.log('✅ Database connected');

        // Drop and recreate schema
        console.log('📦 Creating tables...');
        await dataSource.synchronize(true); // true = drop existing tables
        console.log('✅ Tables created successfully');

        // Seed default data using repositories
        console.log('🌱 Seeding default data...');

        // Create admin user using repository
        const userRepository = dataSource.getRepository(User);
        const adminUser = userRepository.create({
            email: 'admin@heroglobal.io.vn',
            name: 'Admin',
            role: 'admin',
            passwordHash: await bcrypt.hash('admin123', 10),
            heroBalance: 0,
            usdtBalance: 0,
            rank: 'admin',
            walletAddress: null,
            referralCode: null,
            referredById: null,
        });
        await userRepository.save(adminUser);
        console.log('  ✓ Created admin user');

        // Create default categories
        const categoryRepository = dataSource.getRepository(Category);
        const categories = [
            { name: 'NFT Collection', slug: 'nft-collection', description: 'Digital collectibles and NFTs' },
            { name: 'Investment', slug: 'investment', description: 'Investment products' },
            { name: 'Staking', slug: 'staking', description: 'Staking opportunities' },
        ];

        for (const cat of categories) {
            const category = categoryRepository.create(cat);
            await categoryRepository.save(category);
        }
        console.log('  ✓ Created default categories');

        // Create default system config
        const configRepository = dataSource.getRepository(SystemConfig);
        const configs = [
            { key: 'maintenance_mode', value: 'false' },
            { key: 'referral_commission_rate', value: '0.1' },
            { key: 'min_withdrawal_amount', value: '10' },
        ];

        for (const cfg of configs) {
            const config = configRepository.create(cfg);
            await configRepository.save(config);
        }
        console.log('  ✓ Created system config');

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📝 Default admin credentials:');
        console.log('   Email: admin@heroglobal.io.vn');
        console.log('   Password: admin123');
        console.log('   ⚠️  Please change this password immediately!\n');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
    }
}

bootstrap();
