import { Injectable } from '@nestjs/common';
import type { ChecklistItem } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { IChecklistRepository } from '../interfaces/checklist-repository.interface';

@Injectable()
export class ChecklistRepository implements IChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ChecklistItem | null> {
    return this.prisma.checklistItem.findUnique({ where: { id } });
  }

  listByCard(cardId: string): Promise<ChecklistItem[]> {
    return this.prisma.checklistItem.findMany({
      where: { cardId },
      orderBy: { position: 'asc' },
    });
  }

  async lastPositionInCard(cardId: string): Promise<number | null> {
    const row = await this.prisma.checklistItem.findFirst({
      where: { cardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return row?.position ?? null;
  }

  create(data: {
    cardId: string;
    text: string;
    position: number;
  }): Promise<ChecklistItem> {
    return this.prisma.checklistItem.create({ data });
  }

  update(
    id: string,
    data: { text?: string; done?: boolean; position?: number },
  ): Promise<ChecklistItem> {
    return this.prisma.checklistItem.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklistItem.delete({ where: { id } });
  }
}
