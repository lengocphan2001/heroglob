import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('active_power_packages')
export class ActivePowerPackage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ type: 'decimal', precision: 20, scale: 2 })
    price!: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, name: 'daily_profit_percent' })
    dailyProfitPercent!: number;

    @Column({ name: 'duration_days' })
    durationDays!: number;

    @Column({ default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
