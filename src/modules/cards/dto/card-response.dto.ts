import { ApiProperty } from '@nestjs/swagger';
import type { Card } from '@prisma/client';

export class CardResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() stageId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() position!: number;
  @ApiProperty({ nullable: true }) startDate!: Date | null;
  @ApiProperty({ nullable: true }) dueDate!: Date | null;
  @ApiProperty({ nullable: true }) coverAttachmentId!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(c: Card): CardResponseDto {
    return {
      id: c.id,
      stageId: c.stageId,
      title: c.title,
      description: c.description,
      position: c.position,
      startDate: c.startDate,
      dueDate: c.dueDate,
      coverAttachmentId: c.coverAttachmentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
