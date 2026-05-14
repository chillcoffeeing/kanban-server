import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import type { PermissionRequest, PermissionRequestStatus } from "@/generated/prisma/client";
import { BoardAccessService } from "@modules/members/services/board-access.service";
import { MembersService } from "@modules/members/services/members.service";
import type { IPermissionRequestsRepository } from "../interfaces/permission-requests-repository.interface";
import { PERMISSION_REQUESTS_REPOSITORY } from "../interfaces/permission-requests-repository.interface";

@Injectable()
export class PermissionRequestsService {
  constructor(
    @Inject(PERMISSION_REQUESTS_REPOSITORY)
    private readonly repo: IPermissionRequestsRepository,
    private readonly boardAccess: BoardAccessService,
    private readonly members: MembersService,
  ) {}

  async create(
    boardId: string,
    userId: string,
    permission: string | undefined,
  ): Promise<PermissionRequest> {
    const membership = await this.boardAccess.requireMembership(boardId, userId);

    const existing = await this.repo.findPendingByRequester(boardId, membership.id);
    if (existing) {
      throw new ConflictException("Ya tienes una solicitud pendiente para este tablero");
    }

    return this.repo.create({
      boardId,
      requesterId: membership.id,
      permission: permission ?? null,
    });
  }

  async findPendingByBoard(boardId: string): Promise<PermissionRequest[]> {
    return this.repo.findPendingByBoard(boardId);
  }

  async updateStatus(
    id: string,
    boardId: string,
    userId: string,
    status: PermissionRequestStatus,
  ): Promise<PermissionRequest> {
    await this.boardAccess.requireRole(boardId, userId, ["owner"]);

    const request = await this.repo.findById(id);
    if (!request) {
      throw new NotFoundException("Solicitud no encontrada");
    }

    if (request.status !== "pending") {
      throw new ConflictException("La solicitud ya fue procesada");
    }

    const updated = await this.repo.updateStatus(id, status);

    if (status === "approved" && request.permission) {
      try {
        await this.members.addPermission(request.requesterId, request.permission);
      } catch {
        throw new ForbiddenException("No se pudo otorgar el permiso");
      }
    }

    return updated;
  }
}
