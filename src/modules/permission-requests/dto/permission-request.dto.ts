import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";
import { BOARD_PERMISSIONS } from "@shared/board-permissions";
import type { PermissionRequest, PermissionRequestStatus } from "@/generated/prisma/client";

export class CreatePermissionRequestDto {
  @ApiPropertyOptional({ enum: BOARD_PERMISSIONS })
  @IsOptional()
  @IsIn(BOARD_PERMISSIONS as unknown as string[], { each: false })
  permission?: string;
}

export class UpdatePermissionRequestDto {
  @ApiProperty({ enum: ["approved", "rejected"] })
  @IsString()
  @IsIn(["approved", "rejected"])
  status!: "approved" | "rejected";
}

export class PermissionRequestResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() requesterId!: string;
  @ApiProperty() permission!: string | null;
  @ApiProperty({ enum: ["pending", "approved", "rejected"] })
  status!: PermissionRequestStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() requester?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };

  static fromEntity(
    r: PermissionRequest & {
      requester?: { id: string; name: string; email: string; avatarUrl: string | null };
    },
  ): PermissionRequestResponseDto {
    return {
      id: r.id,
      boardId: r.boardId,
      requesterId: r.requesterId,
      permission: r.permission,
      status: r.status,
      createdAt: r.createdAt,
      requester: r.requester,
    };
  }
}
