import { ApiProperty } from '@nestjs/swagger';
import type { BoardMember, BoardRole } from '@/generated/prisma/client';

export class MemberResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() role!: BoardRole;
  @ApiProperty({ type: [String] }) permissions!: string[];
  @ApiProperty() invitedAt!: Date;
  @ApiProperty() user?: {
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
  };

  static fromEntity(m: BoardMember & { user?: { name: string; avatarUrl: string | null; createdAt: Date } }): MemberResponseDto & { user?: { name: string; avatarUrl: string | null; createdAt: Date } } {
    return {
      id: m.id,
      boardId: m.boardId,
      userId: m.userId,
      role: m.role,
      permissions: m.permissions,
      invitedAt: m.invitedAt,
      user: m.user ? { name: m.user.name, avatarUrl: m.user.avatarUrl, createdAt: m.user.createdAt } : undefined,
    };
  }
}
