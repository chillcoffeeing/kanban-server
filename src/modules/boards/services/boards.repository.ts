import { Injectable } from '@nestjs/common';
import type { Board, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { IBoardsRepository } from '../interfaces/boards-repository.interface';

@Injectable()
export class BoardsRepository implements IBoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Board | null> {
    return this.prisma.board.findUnique({ where: { id } });
  }

  listByIds(ids: string[]): Promise<any[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.board.findMany({
      where: { id: { in: ids } },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            stages: true,
            members: true,
          },
        },
        stages: {
          include: {
            _count: {
              select: { cards: true },
            },
          },
        },
      },
    });
  }

  create(data: {
    name: string;
    background?: string;
    preferences?: Prisma.InputJsonValue;
  }): Promise<Board> {
    return this.prisma.board.create({ data });
  }

  update(
    id: string,
    data: { name?: string; background?: string; preferences?: Prisma.InputJsonValue },
  ): Promise<Board> {
    return this.prisma.board.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.board.delete({ where: { id } });
  }
}
