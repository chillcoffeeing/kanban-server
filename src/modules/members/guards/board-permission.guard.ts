import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { BoardRole } from '@prisma/client';
import type { BoardPermission } from '@shared/board-permissions';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardAccessService } from '../services/board-access.service';
import {
  BOARD_ID_PARAM_KEY,
  BOARD_PERMISSION_KEY,
  BOARD_ROLE_KEY,
} from '../decorators/board-permission.decorator';

@Injectable()
export class BoardPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: BoardAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<BoardPermission | undefined>(
      BOARD_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    const roles = this.reflector.getAllAndOverride<BoardRole[] | undefined>(
      BOARD_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permission && !roles) return true;

    const paramName =
      this.reflector.getAllAndOverride<string | undefined>(BOARD_ID_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'id';

    const req = context.switchToHttp().getRequest<{
      params: Record<string, string>;
      user: AuthUser;
      boardMembership?: unknown;
    }>();
    const boardId = req.params[paramName];
    if (!boardId) {
      throw new BadRequestException(`Missing route param '${paramName}' for board access`);
    }

    const membership = roles
      ? await this.access.requireRole(boardId, req.user.id, roles)
      : await this.access.requirePermission(boardId, req.user.id, permission!);
    req.boardMembership = membership;
    return true;
  }
}
