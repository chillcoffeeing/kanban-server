import type { BoardRole } from '@/generated/prisma/client';

export interface BoardMembership {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  permissions: string[];
}

export interface IMembersRepository {
  findById(id: string): Promise<BoardMembership | null>;
  findByUserAndBoard(boardId: string, userId: string): Promise<BoardMembership | null>;
  listByBoard(boardId: string): Promise<(BoardMembership)[]>;
  create(data: {
    boardId: string;
    userId: string;
    role: BoardRole;
    permissions: string[];
  }): Promise<BoardMembership>;
  updateById(id: string, data: { role?: BoardRole; permissions?: string[] }): Promise<BoardMembership>;
  deleteById(id: string): Promise<void>;
  listBoardIdsForUser(userId: string): Promise<{ boardId: string; role: string }[]>;
}

export const MEMBERS_REPOSITORY = Symbol('MEMBERS_REPOSITORY');
