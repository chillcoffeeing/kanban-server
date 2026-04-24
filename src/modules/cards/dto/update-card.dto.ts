import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MaxLength, IsArray } from 'class-validator';

export class UpdateCardDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  title?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  startDate?: Date | null;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  dueDate?: Date | null;
}

export class UpdateMembersDto {
  @ApiProperty() @IsUUID()
  userId!: string;
}