import { ApiProperty } from "@nestjs/swagger";
import type { Board } from "@/generated/prisma/client";
import { LabelResponseDto } from "@modules/labels/dto/label-response.dto";

export class BoardResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() background!: string;
  @ApiProperty() ownerId!: string;
  @ApiProperty({ type: Object }) preferences!: Record<string, unknown>;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ type: LabelResponseDto, isArray: true })
  labels!: LabelResponseDto[];

  static fromEntity(
    b: Board,
    labels: LabelResponseDto[] = [],
  ): BoardResponseDto {
    return {
      id: b.id,
      name: b.name,
      background: b.background,
      ownerId: b.ownerId,
      preferences: b.preferences as Record<string, unknown>,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      labels,
    };
  }
}
