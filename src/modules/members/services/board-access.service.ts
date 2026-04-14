import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { BoardRole } from '@prisma/client';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
  type BoardMembership,
} from '../interfaces/members-repository.interface';
import type { BoardPermission } from '@shared/board-permissions';

@Injectable()
export class BoardAccessService {
  constructor(
    @Inject(MEMBERS_REPOSITORY) private readonly repo: IMembersRepository,
  ) {}

  async requireMembership(
    boardId: string,
    userId: string,
  ): Promise<BoardMembership> {
    const m = await this.repo.findMembership(boardId, userId);
    if (!m) throw new ForbiddenException('Not a member of this board');
    return m;
  }

  async requirePermission(
    boardId: string,
    userId: string,
    permission: BoardPermission,
  ): Promise<BoardMembership> {
    const m = await this.requireMembership(boardId, userId);
    if (m.role === 'owner') return m;
    if (!m.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
    return m;
  }

  async requireRole(
    boardId: string,
    userId: string,
    roles: BoardRole[],
  ): Promise<BoardMembership> {
    const m = await this.requireMembership(boardId, userId);
    if (!roles.includes(m.role)) {
      throw new ForbiddenException(`Requires role: ${roles.join(' or ')}`);
    }
    return m;
  }
}
