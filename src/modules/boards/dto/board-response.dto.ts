import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Board } from "@/generated/prisma/client";
import { LabelResponseDto } from "@modules/labels/dto/label-response.dto";

export class BoardResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() background!: string;
  @ApiProperty({ type: Object }) preferences!: Record<string, unknown>;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ type: LabelResponseDto, isArray: true })
  labels!: LabelResponseDto[];
  @ApiPropertyOptional() stagesCount?: number;
  @ApiPropertyOptional() membersCount?: number;
  @ApiPropertyOptional() cardsCount?: number;

  static fromEntity(
    b: any,
    labels: LabelResponseDto[] = [],
  ): BoardResponseDto {
    const totalCards = b.stages?.reduce((sum: number, stage: any) => {
      return sum + (stage._count?.cards || 0);
    },0) ?? 0;

    return {
      id: b.id,
      name: b.name,
      background: b.background,
      preferences: b.preferences as Record<string, unknown>,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      labels,
      stagesCount: b._count?.stages,
      membersCount: b._count?.members,
      cardsCount: totalCards,
    };
  }
}
