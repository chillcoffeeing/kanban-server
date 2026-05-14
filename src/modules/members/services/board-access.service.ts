import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import type { BoardRole } from '@/generated/prisma/client';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
  type BoardMembership,
} from '../interfaces/members-repository.interface';
import type { BoardPermission } from '@shared/board-permissions';

@Injectable()
export class BoardAccessService {
  private readonly logger = new Logger(BoardAccessService.name);

  constructor(
    @Inject(MEMBERS_REPOSITORY) private readonly repo: IMembersRepository,
  ) {}

  async requireMembership(
    boardId: string,
    userId: string,
  ): Promise<BoardMembership> {
    const m = await this.repo.findByUserAndBoard(boardId, userId);
    if (!m) {
      this.logger.warn(`Access denied: user=${userId} board=${boardId} reason=not_member`);
      throw new ForbiddenException({
        statusCode: 403,
        code: 'NOT_BOARD_MEMBER',
        message: 'No eres miembro de este tablero',
      });
    }
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
      this.logger.warn(`Permission denied: user=${userId} board=${boardId} required=${permission}`);
      throw new ForbiddenException({
        statusCode: 403,
        code: 'MISSING_PERMISSION',
        message: `No tienes permiso para realizar esta acción en este tablero`,
        permission,
      });
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
      this.logger.warn(`Role denied: user=${userId} board=${boardId} required=${roles.join('|')} actual=${m.role}`);
      throw new ForbiddenException({
        statusCode: 403,
        code: 'MISSING_ROLE',
        message: `No tienes el rol necesario para esta acción`,
        requiredRole: roles.join(' or '),
      });
    }
    return m;
  }
}
