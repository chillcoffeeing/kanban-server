import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() @MaxLength(500)
  avatarUrl?: string | null;

  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject()
  profile?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject()
  preferences?: Record<string, unknown>;
}
