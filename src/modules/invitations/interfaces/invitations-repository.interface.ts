import type { BoardRole, Invitation } from '@/generated/prisma/client';

export interface CreateInvitationData {
  boardId: string;
  email: string;
  role: BoardRole;
  token: string;
  expiresAt: Date;
}

export interface IInvitationsRepository {
  findByToken(token: string): Promise<Invitation | null>;
  findPendingByEmail(boardId: string, email: string): Promise<Invitation | null>;
  listByBoard(boardId: string): Promise<Invitation[]>;
  create(data: CreateInvitationData): Promise<Invitation>;
  markAccepted(id: string): Promise<void>;
}

export const INVITATIONS_REPOSITORY = Symbol('INVITATIONS_REPOSITORY');
