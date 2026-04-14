import { ApiProperty } from '@nestjs/swagger';
import type { Label } from '@prisma/client';

export class LabelResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() color!: string;

  static fromEntity(l: Label): LabelResponseDto {
    return { id: l.id, boardId: l.boardId, name: l.name, color: l.color };
  }
}
