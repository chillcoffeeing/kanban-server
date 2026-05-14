import type { PermissionRequest, PermissionRequestStatus } from "@/generated/prisma/client";

export const PERMISSION_REQUESTS_REPOSITORY = Symbol("PERMISSION_REQUESTS_REPOSITORY");

export interface IPermissionRequestsRepository {
  findById(id: string): Promise<PermissionRequest | null>;
  findPendingByBoard(boardId: string): Promise<PermissionRequest[]>;
  findPendingByRequester(
    boardId: string,
    requesterId: string,
  ): Promise<PermissionRequest | null>;
  create(data: {
    boardId: string;
    requesterId: string;
    permission: string | null;
  }): Promise<PermissionRequest>;
  updateStatus(
    id: string,
    status: PermissionRequestStatus,
  ): Promise<PermissionRequest>;
}
