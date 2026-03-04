/**
 * One-time migration: add new columns to payouts and investments tables.
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/add-payout-columns.ts
 * Or: npm run build && node dist/scripts/add-payout-columns.js
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

async function run() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'heroglob',
        synchronize: false,
    });

    await dataSource.initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    const payoutsColumns = [
        { name: 'order_id', sql: "ALTER TABLE payouts ADD COLUMN order_id INT NULL AFTER investment_id" },
        { name: 'wallet_address', sql: "ALTER TABLE payouts ADD COLUMN wallet_address VARCHAR(42) NULL AFTER order_id" },
        { name: 'scheduled_at', sql: "ALTER TABLE payouts ADD COLUMN scheduled_at TIMESTAMP NULL AFTER type" },
        { name: 'status', sql: "ALTER TABLE payouts ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'paid' AFTER scheduled_at" },
    ];

    const investmentsColumns = [
        { name: 'duration_days', sql: "ALTER TABLE investments ADD COLUMN duration_days INT NOT NULL DEFAULT 1 AFTER daily_profit_percent" },
    ];

    for (const col of payoutsColumns) {
        try {
            const has = await runner.query(
                `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payouts' AND COLUMN_NAME = ?`,
                [process.env.DB_NAME || 'heroglob', col.name],
            );
            if (has.length === 0) {
                await runner.query(col.sql);
                console.log('Added payouts.' + col.name);
            } else {
                console.log('payouts.' + col.name + ' already exists');
            }
        } catch (e: any) {
            if (e?.code === 'ER_DUP_FIELDNAME') console.log('payouts.' + col.name + ' already exists');
            else throw e;
        }
    }

    for (const col of investmentsColumns) {
        try {
            const has = await runner.query(
                `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'investments' AND COLUMN_NAME = ?`,
                [process.env.DB_NAME || 'heroglob', col.name],
            );
            if (has.length === 0) {
                await runner.query(col.sql);
                console.log('Added investments.' + col.name);
            } else {
                console.log('investments.' + col.name + ' already exists');
            }
        } catch (e: any) {
            if (e?.code === 'ER_DUP_FIELDNAME') console.log('investments.' + col.name + ' already exists');
            else throw e;
        }
    }

    await runner.release();
    await dataSource.destroy();
    console.log('Migration done.');
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
