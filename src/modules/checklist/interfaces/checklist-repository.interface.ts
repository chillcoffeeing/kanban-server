import type { ChecklistItem } from '@/generated/prisma/client';

export interface IChecklistRepository {
  findById(id: string): Promise<ChecklistItem | null>;
  listByCard(cardId: string): Promise<ChecklistItem[]>;
  lastPositionInCard(cardId: string): Promise<number | null>;
  create(data: {
    cardId: string;
    text: string;
    position: number;
  }): Promise<ChecklistItem>;
  update(
    id: string,
    data: { text?: string; done?: boolean; position?: number },
  ): Promise<ChecklistItem>;
  delete(id: string): Promise<void>;
}

export const CHECKLIST_REPOSITORY = Symbol('CHECKLIST_REPOSITORY');
