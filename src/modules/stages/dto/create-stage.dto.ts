import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStageDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200)
  name!: string;
}
