import { ApiProperty } from "@nestjs/swagger";
import type { BoardMembership, BoardRole } from "@/generated/prisma/client";

export class MemberResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() role!: BoardRole;
  @ApiProperty({ type: [String] }) permissions!: string[];
  @ApiProperty() invitedAt!: Date;
  @ApiProperty() email?: string;
  @ApiProperty() user?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl: string | null;
    createdAt: Date;
  };

  static fromEntity(
    m: BoardMembership & {
      user?: {
        name: string;
        avatarUrl: string | null;
        createdAt: Date;
        id: string;
        email?: string;
      };
    },
  ): MemberResponseDto & {
    user?: {
      name: string;
      avatarUrl: string | null;
      createdAt: Date;
      id: string;
      email?: string;
    };
  } {
    return {
      id: m.id,
      role: m.role,
      permissions: m.permissions,
      invitedAt: m.invitedAt,
      email: m.user?.email,
      user: m.user,
    };
  }
}
