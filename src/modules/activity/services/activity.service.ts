import { Inject, Injectable } from '@nestjs/common';
import type { Activity, Prisma } from '@prisma/client';
import {
  ACTIVITY_REPOSITORY,
  IActivityRepository,
} from '../interfaces/activity-repository.interface';

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY) private readonly repo: IActivityRepository,
  ) {}

  log(input: {
    boardId: string;
    userId: string;
    type: string;
    detail: string;
    meta?: Prisma.InputJsonValue;
  }): Promise<Activity> {
    return this.repo.create(input);
  }

  listByBoard(
    boardId: string,
    opts: { limit: number; before?: Date },
  ): Promise<Activity[]> {
    return this.repo.listByBoard(boardId, opts);
  }
}
