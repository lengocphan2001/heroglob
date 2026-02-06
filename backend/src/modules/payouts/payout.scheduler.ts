import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PayoutService } from './payout.service';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class PayoutScheduler implements OnModuleInit {
    private readonly logger = new Logger(PayoutScheduler.name);
    private readonly JOB_NAME = 'daily_payout_job';

    constructor(
        private readonly payoutService: PayoutService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly configService: SystemConfigService,
    ) { }

    async onModuleInit() {
        await this.setupCronJob();
    }

    async setupCronJob() {
        try {
            const cronExpression = await this.configService.get('PAYOUT_CRON', '0 0 0 * * *');
            const timezone = await this.configService.get('PAYOUT_TIMEZONE', 'Asia/Ho_Chi_Minh');
            this.logger.log(`Setting up daily payout job with schedule: ${cronExpression} in ${timezone}`);

            // Remove existing job if it exists (for refresh support)
            const exists = this.schedulerRegistry.getCronJobs().has(this.JOB_NAME);
            if (exists) {
                this.schedulerRegistry.deleteCronJob(this.JOB_NAME);
            }

            const job = new CronJob(
                cronExpression,
                () => {
                    this.handlePayout();
                },
                null,
                true,
                timezone
            );

            this.schedulerRegistry.addCronJob(this.JOB_NAME, job);
            // job.start(); // CronJob constructor with 'true' as 4th arg already starts it
        } catch (error) {
            this.logger.error('Failed to setup dynamic payout cron job:', error);
        }
    }

    async handlePayout() {
        this.logger.log('Triggering daily payout job...');
        await this.payoutService.processDailyPayouts();
    }

    // This can be called by an admin controller after updating the config
    async refreshJob() {
        this.logger.log('Refreshing payout job schedule...');
        await this.setupCronJob();
    }
}
