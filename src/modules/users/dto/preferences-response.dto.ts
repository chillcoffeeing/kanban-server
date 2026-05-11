import { ApiProperty } from "@nestjs/swagger";
import type { UserPreference } from "@/generated/prisma/client";
import { UserPreferencesSettingsJson } from "../interfaces/settings-json.types";

export class PreferencesResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() settings!: UserPreferencesSettingsJson;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(prefs: UserPreference): PreferencesResponseDto {
    const dto = new PreferencesResponseDto();
    dto.id = prefs.id;
    dto.userId = prefs.userId;
    dto.settings = (prefs.settings as UserPreferencesSettingsJson) ?? {};
    dto.createdAt = prefs.createdAt;
    dto.updatedAt = prefs.updatedAt;
    return dto;
  }
}
