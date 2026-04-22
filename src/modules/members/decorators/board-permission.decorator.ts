import { SetMetadata } from '@nestjs/common';
import type { BoardPermission } from '@shared/board-permissions';
import type { BoardRole } from '@/generated/prisma/client';

export const BOARD_PERMISSION_KEY = 'boardPermission';
export const BOARD_ROLE_KEY = 'boardRole';
export const BOARD_ID_PARAM_KEY = 'boardIdParam';

export const RequireBoardPermission = (permission: BoardPermission): MethodDecorator =>
  SetMetadata(BOARD_PERMISSION_KEY, permission);

export const RequireBoardRole = (...roles: BoardRole[]): MethodDecorator =>
  SetMetadata(BOARD_ROLE_KEY, roles);

/** Override the default ':id' param name used to extract boardId. */
export const BoardIdFromParam = (
  paramName: string,
): MethodDecorator & ClassDecorator => SetMetadata(BOARD_ID_PARAM_KEY, paramName);
