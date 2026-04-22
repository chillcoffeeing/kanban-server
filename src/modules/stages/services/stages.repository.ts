import { Injectable } from '@nestjs/common';
import type { Stage } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { IStagesRepository } from '../interfaces/stages-repository.interface';

@Injectable()
export class StagesRepository implements IStagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Stage | null> {
    return this.prisma.stage.findUnique({ where: { id } });
  }

  listByBoard(boardId: string): Promise<Stage[]> {
    return this.prisma.stage.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });
  }

  async lastPositionInBoard(boardId: string): Promise<number | null> {
    const row = await this.prisma.stage.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return row?.position ?? null;
  }

  create(data: { boardId: string; name: string; position: number }): Promise<Stage> {
    return this.prisma.stage.create({ data });
  }

  update(id: string, data: { name?: string; position?: number }): Promise<Stage> {
    return this.prisma.stage.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stage.delete({ where: { id } });
  }
}
