import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Stage } from '@/generated/prisma/client';
import { positionBetween } from '@shared/position.util';
import {
  IStagesRepository,
  STAGES_REPOSITORY,
} from '../interfaces/stages-repository.interface';

@Injectable()
export class StagesService {
  constructor(
    @Inject(STAGES_REPOSITORY) private readonly repo: IStagesRepository,
  ) {}

  async getById(id: string): Promise<Stage> {
    const s = await this.repo.findById(id);
    if (!s) throw new NotFoundException('Stage not found');
    return s;
  }

  listByBoard(boardId: string): Promise<Stage[]> {
    return this.repo.listByBoard(boardId);
  }

  async create(boardId: string, name: string): Promise<Stage> {
    const last = await this.repo.lastPositionInBoard(boardId);
    return this.repo.create({
      boardId,
      name,
      position: positionBetween(last, null),
    });
  }

  update(id: string, data: { name?: string; position?: number }): Promise<Stage> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
