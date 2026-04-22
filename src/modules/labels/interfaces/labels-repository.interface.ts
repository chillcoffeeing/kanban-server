import type { CardLabel, Label } from '@/generated/prisma/client';

export interface ILabelsRepository {
  findById(id: string): Promise<Label | null>;
  listByBoard(boardId: string): Promise<Label[]>;
  create(data: { boardId: string; name: string; color: string }): Promise<Label>;
  delete(id: string): Promise<void>;

  listByCard(cardId: string): Promise<Label[]>;
  attach(cardId: string, labelId: string): Promise<CardLabel>;
  detach(cardId: string, labelId: string): Promise<void>;
}

export const LABELS_REPOSITORY = Symbol('LABELS_REPOSITORY');
