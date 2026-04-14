import { Global, Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './services/activity.service';
import { ActivityRepository } from './services/activity.repository';
import { ACTIVITY_REPOSITORY } from './interfaces/activity-repository.interface';

@Global()
@Module({
  controllers: [ActivityController],
  providers: [
    ActivityService,
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityRepository },
  ],
  exports: [ActivityService],
})
export class ActivityModule {}
