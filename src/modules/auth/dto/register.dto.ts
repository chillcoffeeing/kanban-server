import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsEmail() @MaxLength(255)
  email!: string;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100)
  name!: string;

  @ApiProperty() @IsString() @MinLength(8) @MaxLength(128)
  password!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)
  username?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  company?: string;
}
