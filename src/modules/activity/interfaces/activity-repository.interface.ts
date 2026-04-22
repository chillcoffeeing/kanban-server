import type { Activity, Prisma } from '@/generated/prisma/client';

export interface CreateActivityData {
  boardId: string;
  userId: string;
  type: string;
  detail: string;
  meta?: Prisma.InputJsonValue;
}

export interface ListActivityOptions {
  limit: number;
  before?: Date;
}

export interface IActivityRepository {
  create(data: CreateActivityData): Promise<Activity>;
  listByBoard(boardId: string, opts: ListActivityOptions): Promise<Activity[]>;
}

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');
