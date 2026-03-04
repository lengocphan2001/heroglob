/**
 * Fix payout amount column: DECIMAL(20,2) rounds 0.003 to 0.00.
 * Change to DECIMAL(20,8) and optionally recalculate zero amounts from investment.
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/fix-payout-amount-scale.ts
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

    try {
        await runner.query('ALTER TABLE payouts MODIFY COLUMN amount DECIMAL(20,8) NOT NULL');
        console.log('Updated payouts.amount to DECIMAL(20,8)');
    } catch (e: any) {
        console.error('Alter amount:', e.message);
    }

    try {
        const zeroPayouts = await runner.query(
            `SELECT p.id, p.investment_id, i.amount as inv_amount, i.daily_profit_percent 
             FROM payouts p 
             JOIN investments i ON i.id = p.investment_id 
             WHERE p.amount = 0 AND p.investment_id IS NOT NULL`
        );
        if (zeroPayouts.length > 0) {
            for (const row of zeroPayouts) {
                const dailyProfit = Number(row.inv_amount) * (Number(row.daily_profit_percent) / 100);
                await runner.query('UPDATE payouts SET amount = ? WHERE id = ?', [dailyProfit, row.id]);
            }
            console.log('Recalculated amount for', zeroPayouts.length, 'payout(s) that were 0');
        }
    } catch (e: any) {
        console.error('Recalculate zero amounts:', e.message);
    }

    await runner.release();
    await dataSource.destroy();
    console.log('Done.');
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
