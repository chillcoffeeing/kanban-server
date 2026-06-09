import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class ActivityCleanupService {
  private readonly logger = new Logger(ActivityCleanupService.name);
  private readonly RETENTION_DAYS = 15;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanup(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.RETENTION_DAYS);

    const { count } = await this.prisma.activity.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    if (count > 0) {
      this.logger.log(`Cleaned up ${count} activity records older than ${this.RETENTION_DAYS} days`);
    }
  }
}
