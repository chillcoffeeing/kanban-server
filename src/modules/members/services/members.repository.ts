import { Injectable } from '@nestjs/common';
import type { BoardMember, BoardRole } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type {
  BoardMembership,
  IMembersRepository,
} from '../interfaces/members-repository.interface';

@Injectable()
export class MembersRepository implements IMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMembership(boardId: string, userId: string): Promise<BoardMembership | null> {
    return this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: {
        id: true,
        boardId: true,
        userId: true,
        role: true,
        permissions: true,
      },
    });
  }

  listByBoard(boardId: string): Promise<BoardMember[]> {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      orderBy: { invitedAt: 'asc' },
    });
  }

  create(data: {
    boardId: string;
    userId: string;
    role: BoardRole;
    permissions: string[];
  }): Promise<BoardMember> {
    return this.prisma.boardMember.create({ data });
  }

  update(
    boardId: string,
    userId: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<BoardMember> {
    return this.prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId } },
      data,
    });
  }

  async delete(boardId: string, userId: string): Promise<void> {
    await this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId } },
    });
  }

  async listBoardIdsForUser(userId: string): Promise<string[]> {
    const rows = await this.prisma.boardMember.findMany({
      where: { userId },
      select: { boardId: true },
    });
    return rows.map((r) => r.boardId);
  }
}
