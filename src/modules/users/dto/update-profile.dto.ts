import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() @MaxLength(500)
  coverUrl?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  company?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  location?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() @MaxLength(500)
  socialWebsite?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  socialTwitter?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  socialGithub?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  socialLinkedin?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  socialInstagram?: string | null;
}
