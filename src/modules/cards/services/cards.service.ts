import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Card } from '@prisma/client';
import { positionBetween } from '@shared/position.util';
import { StagesService } from '@modules/stages/services/stages.service';
import type {
  ICardsRepository,
  UpdateCardData,
} from '../interfaces/cards-repository.interface';
import { CARDS_REPOSITORY } from '../interfaces/cards.tokens';

@Injectable()
export class CardsService {
  constructor(
    @Inject(CARDS_REPOSITORY) private readonly repo: ICardsRepository,
    private readonly stages: StagesService,
  ) {}

  async getById(id: string): Promise<Card> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Card not found');
    return c;
  }

  /** Resolve boardId for authorization given a cardId. */
  async getBoardIdForCard(cardId: string): Promise<string> {
    const card = await this.getById(cardId);
    const stage = await this.stages.getById(card.stageId);
    return stage.boardId;
  }

  async create(
    stageId: string,
    data: {
      title: string;
      description?: string;
      startDate?: Date;
      dueDate?: Date;
    },
  ): Promise<Card> {
    await this.stages.getById(stageId);
    const last = await this.repo.lastPositionInStage(stageId);
    return this.repo.create({
      stageId,
      title: data.title,
      description: data.description ?? '',
      position: positionBetween(last, null),
      startDate: data.startDate,
      dueDate: data.dueDate,
    });
  }

  update(id: string, data: UpdateCardData): Promise<Card> {
    return this.repo.update(id, data);
  }

  async move(cardId: string, stageId: string, index: number): Promise<Card> {
    const card = await this.getById(cardId);
    const target = await this.stages.getById(stageId);
    const source = await this.stages.getById(card.stageId);
    if (target.boardId !== source.boardId) {
      throw new BadRequestException('Cannot move card across boards');
    }

    // Neighbors in target stage — if moving within same stage, exclude self.
    const { prev, next } = await this.repo.neighborPositions(stageId, index);
    const position = positionBetween(
      prev === card.position ? null : prev,
      next === card.position ? null : next,
    );
    return this.repo.update(cardId, { stageId, position });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  search(boardId: string, query: string): Promise<Card[]> {
    return this.repo.search(boardId, query);
  }

  listByBoard(boardId: string): Promise<Card[]> {
    return this.repo.listByBoard(boardId);
  }
}
