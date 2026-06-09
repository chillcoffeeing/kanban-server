import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './services/activity.service';
import { ActivityRepository } from './services/activity.repository';
import { ActivityListener } from './activity.listener';
import { ActivityCleanupService } from './activity-cleanup.service';
import { ACTIVITY_REPOSITORY } from './interfaces/activity-repository.interface';

@Module({
  controllers: [ActivityController],
  providers: [
    ActivityService,
    ActivityListener,
    ActivityCleanupService,
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityRepository },
  ],
  exports: [ActivityService],
})
export class ActivityModule {}
