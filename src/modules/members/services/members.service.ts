import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BoardMember, BoardRole } from '@/generated/prisma/client';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
} from '../interfaces/members-repository.interface';
import { DEFAULT_MEMBER_PERMISSIONS, type BoardPermission } from '@shared/board-permissions';

@Injectable()
export class MembersService {
  constructor(
    @Inject(MEMBERS_REPOSITORY) private readonly repo: IMembersRepository,
  ) {}

  listByBoard(boardId: string): Promise<(BoardMember)[]> {
    return this.repo.listByBoard(boardId);
  }

  listBoardIdsForUser(userId: string): Promise<string[]> {
    return this.repo.listBoardIdsForUser(userId);
  }

  async add(
    boardId: string,
    userId: string,
    role: BoardRole,
    permissions: BoardPermission[] = DEFAULT_MEMBER_PERMISSIONS,
  ): Promise<BoardMember> {
    const existing = await this.repo.findMembership(boardId, userId);
    if (existing) throw new ConflictException('User is already a member');
    return this.repo.create({ boardId, userId, role, permissions });
  }

  async update(
    boardId: string,
    userId: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<BoardMember> {
    const membership = await this.repo.findMembership(boardId, userId);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner' && data.role && data.role !== 'owner') {
      throw new BadRequestException('Cannot demote the board owner');
    }
    return this.repo.update(boardId, userId, data);
  }

  async remove(boardId: string, userId: string): Promise<void> {
    const membership = await this.repo.findMembership(boardId, userId);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner') {
      throw new BadRequestException('Cannot remove the board owner');
    }
    await this.repo.delete(boardId, userId);
  }
}
