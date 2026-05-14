import { Injectable } from "@nestjs/common";
import type { BoardRole } from "@/generated/prisma/client";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import type { IMembersRepository } from "../interfaces/members-repository.interface";

@Injectable()
export class MembersRepository implements IMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<any | null> {
    return this.prisma.boardMembership.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        permissions: true,
        user: {
          select: {
            name: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findByUserAndBoard(boardId: string, userId: string): Promise<any | null> {
    return this.prisma.boardMembership.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: {
        id: true,
        role: true,
        permissions: true,
        user: {
          select: {
            name: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });
  }

  listByBoard(boardId: string): Promise<any[]> {
    return this.prisma.boardMembership.findMany({
      where: { boardId },
      orderBy: { invitedAt: "asc" },
      select: {
        id: true,
        invitedAt: true,
        role: true,
        permissions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });
  }

  create(data: {
    boardId: string;
    userId: string;
    role: BoardRole;
    permissions: string[];
  }): Promise<any> {
    return this.prisma.boardMembership.create({ data });
  }

  updateById(
    id: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<any> {
    return this.prisma.boardMembership.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.boardMembership.delete({
      where: { id },
    });
  }

  async listBoardIdsForUser(userId: string): Promise<{ boardId: string; role: string }[]> {
    return this.prisma.boardMembership.findMany({
      where: { userId },
      select: { boardId: true, role: true },
    });
  }
}
