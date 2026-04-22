import { ApiProperty } from '@nestjs/swagger';
import type { Stage } from '@/generated/prisma/client';

export class StageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() position!: number;
  @ApiProperty() createdAt!: Date;

  static fromEntity(s: Stage): StageResponseDto {
    return {
      id: s.id,
      boardId: s.boardId,
      name: s.name,
      position: s.position,
      createdAt: s.createdAt,
    };
  }
}
