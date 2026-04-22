import type { Stage } from '@/generated/prisma/client';

export interface IStagesRepository {
  findById(id: string): Promise<Stage | null>;
  listByBoard(boardId: string): Promise<Stage[]>;
  lastPositionInBoard(boardId: string): Promise<number | null>;
  create(data: { boardId: string; name: string; position: number }): Promise<Stage>;
  update(id: string, data: { name?: string; position?: number }): Promise<Stage>;
  delete(id: string): Promise<void>;
}

export const STAGES_REPOSITORY = Symbol('STAGES_REPOSITORY');
