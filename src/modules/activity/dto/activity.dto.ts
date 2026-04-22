import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { Activity } from '@/generated/prisma/client';

export class ListActivityQueryDto {
  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;

  @ApiPropertyOptional({ description: 'ISO date cursor (exclusive upper bound)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  before?: Date;
}

export class ActivityResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() type!: string;
  @ApiProperty() detail!: string;
  @ApiProperty({ type: Object }) meta!: Record<string, unknown>;
  @ApiProperty() createdAt!: Date;

  static fromEntity(a: Activity): ActivityResponseDto {
    return {
      id: a.id,
      boardId: a.boardId,
      userId: a.userId,
      type: a.type,
      detail: a.detail,
      meta: a.meta as Record<string, unknown>,
      createdAt: a.createdAt,
    };
  }
}
