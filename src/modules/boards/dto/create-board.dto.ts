import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  background?: string;

  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject()
  preferences?: Record<string, unknown>;
}
