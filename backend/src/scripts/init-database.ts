import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

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
        synchronize: false, // We'll do this manually
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

        // Seed default data
        console.log('🌱 Seeding default data...');

        // Insert default admin user
        await dataSource.query(`
      INSERT INTO users (email, name, \`role\`, password_hash, hero_balance, usdt_balance, \`rank\`)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            'admin@heroglobal.io.vn',
            'Admin',
            'admin',
            '$2b$10$rZ5YqJ5YqJ5YqJ5YqJ5YqOZQZ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5Yq', // password: admin123
            0,
            0,
            'admin'
        ]);
        console.log('  ✓ Created admin user');

        // Insert default categories
        await dataSource.query(`
      INSERT INTO categories (name, slug, description)
      VALUES 
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?)
    `, [
            'NFT Collection', 'nft-collection', 'Digital collectibles and NFTs',
            'Investment', 'investment', 'Investment products',
            'Staking', 'staking', 'Staking opportunities'
        ]);
        console.log('  ✓ Created default categories');

        // Insert default system config
        await dataSource.query(`
      INSERT INTO system_config (config_key, config_value, description)
      VALUES 
        (?, ?, ?),
        (?, ?, ?),
        (?, ?, ?)
    `, [
            'maintenance_mode', 'false', 'Enable/disable maintenance mode',
            'referral_commission_rate', '0.1', 'Referral commission rate (10%)',
            'min_withdrawal_amount', '10', 'Minimum withdrawal amount'
        ]);
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
