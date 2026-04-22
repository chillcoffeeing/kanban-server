import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Board, Prisma } from '@/generated/prisma/client';
import { MembersService } from '@modules/members/services/members.service';
import {
  BOARDS_REPOSITORY,
  IBoardsRepository,
} from '../interfaces/boards-repository.interface';

@Injectable()
export class BoardsService {
  constructor(
    @Inject(BOARDS_REPOSITORY) private readonly repo: IBoardsRepository,
    private readonly members: MembersService,
  ) {}

  async getById(id: string): Promise<Board> {
    const board = await this.repo.findById(id);
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async listForUser(userId: string): Promise<Board[]> {
    const ids = await this.members.listBoardIdsForUser(userId);
    return this.repo.listByIds(ids);
  }

  async create(
    ownerId: string,
    data: {
      name: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ): Promise<Board> {
    const board = await this.repo.create({
      name: data.name,
      background: data.background,
      ownerId,
      preferences: data.preferences as Prisma.InputJsonValue | undefined,
    });
    await this.members.add(board.id, ownerId, 'owner');
    return board;
  }

  update(
    id: string,
    data: {
      name?: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ): Promise<Board> {
    return this.repo.update(id, {
      name: data.name,
      background: data.background,
      preferences: data.preferences as Prisma.InputJsonValue | undefined,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
