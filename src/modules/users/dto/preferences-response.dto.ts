import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { UserPreference } from "@/generated/prisma/client";

export class PreferencesResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() theme!: string;
  @ApiProperty() background!: string;
  @ApiProperty() density!: string;
  @ApiProperty() language!: string;
  @ApiProperty() timezone!: string;
  @ApiProperty() timeFormat!: string;
  @ApiProperty() dateFormat!: string;
  @ApiProperty() reducedMotion!: boolean;
  @ApiProperty() showCompletedCards!: boolean;
  @ApiProperty() emailEnabled!: boolean;
  @ApiProperty() pushEnabled!: boolean;
  @ApiProperty() mentions!: boolean;
  @ApiProperty() cardAssigned!: boolean;
  @ApiProperty() cardDueSoon!: boolean;
  @ApiProperty() boardInvites!: boolean;
  @ApiProperty() weeklyDigest!: boolean;
  @ApiProperty() profileVisibility!: string;
  @ApiProperty() showEmail!: boolean;
  @ApiProperty() showActivity!: boolean;
  @ApiProperty() allowDM!: boolean;
  @ApiProperty() analyticsOptOut!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(prefs: UserPreference): PreferencesResponseDto {
    const dto = new PreferencesResponseDto();
    dto.id = prefs.id;
    dto.userId = prefs.userId;
    dto.theme = prefs.theme;
    dto.background = prefs.background;
    dto.density = prefs.density;
    dto.language = prefs.language;
    dto.timezone = prefs.timezone;
    dto.timeFormat = prefs.timeFormat;
    dto.dateFormat = prefs.dateFormat;
    dto.reducedMotion = prefs.reducedMotion;
    dto.showCompletedCards = prefs.showCompletedCards;
    dto.emailEnabled = prefs.emailEnabled;
    dto.pushEnabled = prefs.pushEnabled;
    dto.mentions = prefs.mentions;
    dto.cardAssigned = prefs.cardAssigned;
    dto.cardDueSoon = prefs.cardDueSoon;
    dto.boardInvites = prefs.boardInvites;
    dto.weeklyDigest = prefs.weeklyDigest;
    dto.profileVisibility = prefs.profileVisibility;
    dto.showEmail = prefs.showEmail;
    dto.showActivity = prefs.showActivity;
    dto.allowDM = prefs.allowDM;
    dto.analyticsOptOut = prefs.analyticsOptOut;
    dto.createdAt = prefs.createdAt;
    dto.updatedAt = prefs.updatedAt;
    return dto;
  }
}
