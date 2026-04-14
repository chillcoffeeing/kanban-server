import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class MoveCardDto {
  @ApiProperty() @IsUUID()
  stageId!: string;

  @ApiProperty() @IsInt() @Min(0)
  index!: number;
}
