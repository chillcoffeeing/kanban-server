import type { Board, Prisma } from '@/generated/prisma/client';

export interface IBoardsRepository {
  findById(id: string): Promise<Board | null>;
  listByIds(ids: string[]): Promise<Board[]>;
  create(data: {
    name: string;
    background?: string;
    ownerId: string;
    preferences?: Prisma.InputJsonValue;
  }): Promise<Board>;
  update(
    id: string,
    data: {
      name?: string;
      background?: string;
      preferences?: Prisma.InputJsonValue;
    },
  ): Promise<Board>;
  delete(id: string): Promise<void>;
}

export const BOARDS_REPOSITORY = Symbol('BOARDS_REPOSITORY');
