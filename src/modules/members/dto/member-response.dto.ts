import { ApiProperty } from '@nestjs/swagger';
import type { BoardMember, BoardRole } from '@prisma/client';

export class MemberResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() role!: BoardRole;
  @ApiProperty({ type: [String] }) permissions!: string[];
  @ApiProperty() invitedAt!: Date;

  static fromEntity(m: BoardMember): MemberResponseDto {
    return {
      id: m.id,
      boardId: m.boardId,
      userId: m.userId,
      role: m.role,
      permissions: m.permissions,
      invitedAt: m.invitedAt,
    };
  }
}
