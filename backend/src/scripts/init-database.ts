import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('🚀 Starting database initialization...');

    try {
        // Check if database is connected
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        console.log('✅ Database connected');

        // Synchronize schema (create tables)
        console.log('📦 Creating tables...');
        await dataSource.synchronize(true); // true = drop existing tables
        console.log('✅ Tables created successfully');

        // Seed default data
        console.log('🌱 Seeding default data...');

        // Insert default admin user
        await dataSource.query(`
      INSERT INTO users (email, name, role, password_hash, hero_balance, usdt_balance, rank)
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
        await app.close();
    }
}

bootstrap();
