import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CardLabel, Label } from '@/generated/prisma/client';
import {
  ILabelsRepository,
  LABELS_REPOSITORY,
} from '../interfaces/labels-repository.interface';

@Injectable()
export class LabelsService {
  constructor(
    @Inject(LABELS_REPOSITORY) private readonly repo: ILabelsRepository,
  ) {}

  listByBoard(boardId: string): Promise<Label[]> {
    return this.repo.listByBoard(boardId);
  }

  create(boardId: string, data: { name: string; color: string }): Promise<Label> {
    return this.repo.create({ boardId, ...data });
  }

  async delete(id: string): Promise<void> {
    const label = await this.repo.findById(id);
    if (!label) throw new NotFoundException('Label not found');
    await this.repo.delete(id);
  }

  async getBoardIdForLabel(labelId: string): Promise<string> {
    const label = await this.repo.findById(labelId);
    if (!label) throw new NotFoundException('Label not found');
    return label.boardId;
  }

  listByCard(cardId: string): Promise<Label[]> {
    return this.repo.listByCard(cardId);
  }

  async attach(
    cardId: string,
    labelId: string,
    expectedBoardId: string,
  ): Promise<CardLabel> {
    const label = await this.repo.findById(labelId);
    if (!label) throw new NotFoundException('Label not found');
    if (label.boardId !== expectedBoardId) {
      throw new BadRequestException('Label belongs to a different board');
    }
    return this.repo.attach(cardId, labelId);
  }

  async detach(cardId: string, labelId: string): Promise<void> {
    await this.repo.detach(cardId, labelId);
  }
}
