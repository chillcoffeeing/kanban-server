import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Board, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { MembersService } from '@modules/members/services/members.service';
import {
  BOARDS_REPOSITORY,
  IBoardsRepository,
} from '../interfaces/boards-repository.interface';

@Injectable()
export class BoardsService {
  constructor(
    @Inject(BOARDS_REPOSITORY) private readonly repo: IBoardsRepository,
    private readonly prisma: PrismaService,
    private readonly members: MembersService,
  ) {}

  async getById(id: string): Promise<Board> {
    const board = await this.repo.findById(id);
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async listForUser(userId: string): Promise<any[]> {
    const memberships = await this.members.listBoardIdsForUser(userId);
    const ids = memberships.map((m) => m.boardId);
    const boards = await this.repo.listByIds(ids);
    const roleByBoard = new Map(memberships.map((m) => [m.boardId, m.role]));
    return boards.map((board) => ({
      ...board,
      userRole: roleByBoard.get(board.id),
    }));
  }

  async create(
    userId: string,
    data: {
      name: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ): Promise<Board> {
    return this.prisma.$transaction(async (prisma) => {
      const board = await prisma.board.create({
        data: {
          name: data.name,
          background: data.background,
        },
      });

      await prisma.boardMembership.create({
        data: {
          boardId: board.id,
          userId: userId,
          role: 'owner',
          permissions: [
            'create_stage',
            'create_card',
            'modify_card',
            'delete_card',
            'invite_member',
          ],
        },
      });

      return board;
    });
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
