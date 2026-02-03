import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivePowerPackage } from './entities/active-power-package.entity';

@Injectable()
export class ActivePowerService {
    constructor(
        @InjectRepository(ActivePowerPackage)
        private repo: Repository<ActivePowerPackage>,
    ) { }

    findAll() {
        return this.repo.find({ order: { price: 'ASC' } });
    }

    findActive() {
        return this.repo.find({
            where: { isActive: true },
            order: { price: 'ASC' }
        });
    }

    async findOne(id: number) {
        const item = await this.repo.findOneBy({ id });
        if (!item) throw new NotFoundException(`Package #${id} not found`);
        return item;
    }

    create(data: Partial<ActivePowerPackage>) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }

    async update(id: number, data: Partial<ActivePowerPackage>) {
        const item = await this.findOne(id);
        this.repo.merge(item, data);
        return this.repo.save(item);
    }

    async remove(id: number) {
        const item = await this.findOne(id);
        return this.repo.remove(item);
    }
}
