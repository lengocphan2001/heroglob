import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    key!: string;

    @Column()
    value!: string;
}
