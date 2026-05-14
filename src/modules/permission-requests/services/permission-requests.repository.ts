import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import type { PermissionRequest, PermissionRequestStatus } from "@/generated/prisma/client";
import type { IPermissionRequestsRepository } from "../interfaces/permission-requests-repository.interface";

@Injectable()
export class PermissionRequestsRepository implements IPermissionRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PermissionRequest | null> {
    return this.prisma.permissionRequest.findUnique({ where: { id } });
  }

  async findPendingByBoard(boardId: string): Promise<PermissionRequest[]> {
    return this.prisma.permissionRequest.findMany({
      where: { boardId, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
  }

  async findPendingByRequester(
    boardId: string,
    requesterId: string,
  ): Promise<PermissionRequest | null> {
    return this.prisma.permissionRequest.findFirst({
      where: { boardId, requesterId, status: "pending" },
    });
  }

  async create(data: {
    boardId: string;
    requesterId: string;
    permission: string | null;
  }): Promise<PermissionRequest> {
    return this.prisma.permissionRequest.create({ data });
  }

  async updateStatus(
    id: string,
    status: PermissionRequestStatus,
  ): Promise<PermissionRequest> {
    return this.prisma.permissionRequest.update({
      where: { id },
      data: { status },
      include: {
        requester: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
  }
}
