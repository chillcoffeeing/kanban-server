import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ChecklistItem } from '@/generated/prisma/client';

export class CreateChecklistItemDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(500)
  text!: string;
}

export class UpdateChecklistItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(500)
  text?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  done?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsNumber()
  position?: number;
}

export class ChecklistItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() cardId!: string;
  @ApiProperty() text!: string;
  @ApiProperty() done!: boolean;
  @ApiProperty() position!: number;

  static fromEntity(i: ChecklistItem): ChecklistItemResponseDto {
    return {
      id: i.id,
      cardId: i.cardId,
      text: i.text,
      done: i.done,
      position: i.position,
    };
  }
}
