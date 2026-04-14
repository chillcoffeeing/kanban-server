import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ChecklistItem } from '@prisma/client';
import { positionBetween } from '@shared/position.util';
import {
  CHECKLIST_REPOSITORY,
  IChecklistRepository,
} from '../interfaces/checklist-repository.interface';

@Injectable()
export class ChecklistService {
  constructor(
    @Inject(CHECKLIST_REPOSITORY) private readonly repo: IChecklistRepository,
  ) {}

  listByCard(cardId: string): Promise<ChecklistItem[]> {
    return this.repo.listByCard(cardId);
  }

  async create(cardId: string, text: string): Promise<ChecklistItem> {
    const last = await this.repo.lastPositionInCard(cardId);
    return this.repo.create({
      cardId,
      text,
      position: positionBetween(last, null),
    });
  }

  async getById(id: string): Promise<ChecklistItem> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Checklist item not found');
    return item;
  }

  update(
    id: string,
    data: { text?: string; done?: boolean; position?: number },
  ): Promise<ChecklistItem> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
