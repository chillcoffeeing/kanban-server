import { Injectable } from '@nestjs/common';
import type { CardLabel, Label } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { ILabelsRepository } from '../interfaces/labels-repository.interface';

@Injectable()
export class LabelsRepository implements ILabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Label | null> {
    return this.prisma.label.findUnique({ where: { id } });
  }

  listByBoard(boardId: string): Promise<Label[]> {
    return this.prisma.label.findMany({
      where: { boardId },
      orderBy: { name: 'asc' },
    });
  }

  create(data: { boardId: string; name: string; color: string }): Promise<Label> {
    return this.prisma.label.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.label.delete({ where: { id } });
  }

  async listByCard(cardId: string): Promise<Label[]> {
    const rows = await this.prisma.cardLabel.findMany({
      where: { cardId },
      include: { label: true },
    });
    return rows.map((r) => r.label);
  }

  attach(cardId: string, labelId: string): Promise<CardLabel> {
    return this.prisma.cardLabel.upsert({
      where: { cardId_labelId: { cardId, labelId } },
      update: {},
      create: { cardId, labelId },
    });
  }

  async detach(cardId: string, labelId: string): Promise<void> {
    await this.prisma.cardLabel.deleteMany({ where: { cardId, labelId } });
  }
}
