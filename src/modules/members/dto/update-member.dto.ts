import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import { ArrayUnique, IsEnum, IsIn, IsOptional } from 'class-validator';
import { BOARD_PERMISSIONS, type BoardPermission } from '@shared/board-permissions';

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: BoardRole })
  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole;

  @ApiPropertyOptional({ isArray: true, enum: BOARD_PERMISSIONS })
  @IsOptional()
  @ArrayUnique()
  @IsIn(BOARD_PERMISSIONS as unknown as string[], { each: true })
  permissions?: BoardPermission[];
}
