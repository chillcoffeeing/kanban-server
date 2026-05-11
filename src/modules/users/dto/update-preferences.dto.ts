import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserPreferencesSettingsJson } from "../interfaces/settings-json.types";

export class UpdatePreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  settings?: UserPreferencesSettingsJson;
}
