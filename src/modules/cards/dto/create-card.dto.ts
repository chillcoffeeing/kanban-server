import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(500)
  title!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  startDate?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate()
  dueDate?: Date;
}
