import type { Card, Prisma } from '@/generated/prisma/client';

export interface CreateCardData {
  stageId: string;
  title: string;
  description?: string;
  position: number;
  startDate?: Date | null;
  dueDate?: Date | null;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
  position?: number;
  stageId?: string;
}

export interface ICardsRepository {
  findById(id: string): Promise<Card | null>;
  listByStage(stageId: string): Promise<Card[]>;
  listByBoard(boardId: string): Promise<Card[]>;
  lastPositionInStage(stageId: string): Promise<number | null>;
  create(data: CreateCardData): Promise<Card>;
  update(id: string, data: UpdateCardData): Promise<Card>;
  delete(id: string): Promise<void>;
  search(boardId: string, query: string, limit?: number): Promise<Card[]>;
  neighborPositions(
    stageId: string,
    index: number,
  ): Promise<{ prev: number | null; next: number | null }>;
}

export type CardPrismaSelect = Prisma.CardGetPayload<{ select: { id: true } }>;
