import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from '@config/config.module';
import { TypedConfigService } from '@config/typed-config.service';
import { AppLoggerModule } from '@common/logging/logger.module';
import { AppThrottlerModule } from '@common/throttler/throttler.module';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { RealtimeModule } from '@infrastructure/realtime/realtime.module';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { MembersModule } from '@modules/members/members.module';
import { BoardsModule } from '@modules/boards/boards.module';
import { StagesModule } from '@modules/stages/stages.module';
import { CardsModule } from '@modules/cards/cards.module';
import { LabelsModule } from '@modules/labels/labels.module';
import { ChecklistModule } from '@modules/checklist/checklist.module';
import { CommentsModule } from '@modules/comments/comments.module';
import { AttachmentsModule } from '@modules/attachments/attachments.module';
import { ActivityModule } from '@modules/activity/activity.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppThrottlerModule,
    PrismaModule,
    StorageModule,
    RedisModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    MembersModule,
    BoardsModule,
    StagesModule,
    CardsModule,
    LabelsModule,
    ChecklistModule,
    CommentsModule,
    AttachmentsModule,
    ActivityModule,
    InvitationsModule,
    HealthModule,
  ],
  providers: [
    TypedConfigService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [TypedConfigService],
})
export class AppModule {}
