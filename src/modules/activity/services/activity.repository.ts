import { Injectable } from '@nestjs/common';
import type { Activity } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type {
  CreateActivityData,
  IActivityRepository,
  ListActivityOptions,
} from '../interfaces/activity-repository.interface';

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateActivityData): Promise<Activity> {
    return this.prisma.activity.create({ data });
  }

  listByBoard(boardId: string, opts: ListActivityOptions): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: {
        boardId,
        ...(opts.before ? { createdAt: { lt: opts.before } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: opts.limit,
    });
  }
}
