import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ type: Object }) @IsObject()
  preferences!: Record<string, unknown>;
}
