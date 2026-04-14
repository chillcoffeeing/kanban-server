import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50)
  name!: string;

  @ApiProperty() @IsString() @Matches(/^#?[0-9a-zA-Z-]+$/) @MaxLength(20)
  color!: string;
}
