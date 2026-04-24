import { HttpException, Injectable } from "@nestjs/common";
import type { Card } from "@/generated/prisma/client";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import type {
  CreateCardData,
  ICardsRepository,
  UpdateCardData,
  UpdateMembersData,
} from "../interfaces/cards-repository.interface";

@Injectable()
export class CardsRepository implements ICardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Card | null> {
    return this.prisma.card.findUnique({
      where: { id },
      include: {
        members: { select: { userId: true, user: { select: { name: true } } } },
        checklistItems: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
      },
    });
  }

  listByStage(stageId: string): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: { stageId },
      orderBy: { position: "asc" },
      include: {
        checklistItems: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
      },
    });
  }

  listByBoard(boardId: string): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: { stage: { boardId } },
      orderBy: { position: "asc" },
      include: {
        members: { select: { userId: true, user: { select: { name: true } } } },
        checklistItems: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
      },
    });
  }

  async lastPositionInStage(stageId: string): Promise<number | null> {
    const row = await this.prisma.card.findFirst({
      where: { stageId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return row?.position ?? null;
  }

  create(data: CreateCardData): Promise<Card> {
    return this.prisma.card.create({ data });
  }

  update(id: string, data: UpdateCardData): Promise<Card> {
    return this.prisma.card.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.card.delete({ where: { id } });
  }

  search(boardId: string, query: string, limit = 20): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: {
        stage: { boardId },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    });
  }

  async neighborPositions(
    stageId: string,
    index: number,
  ): Promise<{ prev: number | null; next: number | null }> {
    const siblings = await this.prisma.card.findMany({
      where: { stageId },
      orderBy: { position: "asc" },
      select: { position: true },
    });
    const bounded = Math.max(0, Math.min(index, siblings.length));
    return {
      prev: bounded > 0 ? siblings[bounded - 1].position : null,
      next: bounded < siblings.length ? siblings[bounded].position : null,
    };
  }

  async updateMembers(data: UpdateMembersData): Promise<any> {
    const existing = await this.prisma.cardMember.findUnique({
      where: { cardId_userId: { cardId: data.cardId, userId: data.userId } },
    });

    if (data.action === "removeMember") {
      if (!existing) {
        throw new HttpException("Member not found", 404);
      }

      const result = await this.prisma.cardMember.delete({
        where: { cardId_userId: { cardId: data.cardId, userId: data.userId } },
      });

      return result;
    } else {
      if (existing) {
        throw new HttpException("Member already exists", 409);
      }

      const result = await this.prisma.cardMember.create({
        data: { cardId: data.cardId, userId: data.userId },
      });

      return result;
    }
  }
}
