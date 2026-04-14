import type { BoardMember, BoardRole } from '@prisma/client';

export interface BoardMembership {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  permissions: string[];
}

export interface IMembersRepository {
  findMembership(boardId: string, userId: string): Promise<BoardMembership | null>;
  listByBoard(boardId: string): Promise<BoardMember[]>;
  create(data: {
    boardId: string;
    userId: string;
    role: BoardRole;
    permissions: string[];
  }): Promise<BoardMember>;
  update(
    boardId: string,
    userId: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<BoardMember>;
  delete(boardId: string, userId: string): Promise<void>;
  listBoardIdsForUser(userId: string): Promise<string[]>;
}

export const MEMBERS_REPOSITORY = Symbol('MEMBERS_REPOSITORY');
