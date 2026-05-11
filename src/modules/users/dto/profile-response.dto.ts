import { ApiProperty } from "@nestjs/swagger";
import type { UserProfile } from "@/generated/prisma/client";
import { UserProfileJson } from "../interfaces/settings-json.types";

export class ProfileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() profile!: UserProfileJson;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(profile: UserProfile): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = profile.id;
    dto.userId = profile.userId;
    dto.profile = (profile.profile as UserProfileJson) ?? {};
    dto.createdAt = profile.createdAt;
    dto.updatedAt = profile.updatedAt;
    return dto;
  }
}
