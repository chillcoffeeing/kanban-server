import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BoardRole } from '@/generated/prisma/client';
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

  listByBoard(boardId: string): Promise<any[]> {
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
  ): Promise<any> {
    const existing = await this.repo.findByUserAndBoard(boardId, userId);
    if (existing) throw new ConflictException('User is already a member');
    return this.repo.create({ boardId, userId, role, permissions });
  }

  async updateById(
    id: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<any> {
    const membership = await this.repo.findById(id);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner' && data.role && data.role !== 'owner') {
      throw new BadRequestException('Cannot demote the board owner');
    }
    return this.repo.updateById(id, data);
  }

  async removeById(id: string): Promise<void> {
    const membership = await this.repo.findById(id);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner') {
      throw new BadRequestException('Cannot remove the board owner');
    }
    await this.repo.deleteById(id);
  }
}
