import { ApiProperty } from "@nestjs/swagger";
import type { Profile } from "@/generated/prisma/client";

export class ProfileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ nullable: true }) coverUrl!: string | null;
  @ApiProperty({ nullable: true }) bio!: string | null;
  @ApiProperty({ nullable: true }) jobTitle!: string | null;
  @ApiProperty({ nullable: true }) company!: string | null;
  @ApiProperty({ nullable: true }) location!: string | null;
  @ApiProperty({ nullable: true }) socialWebsite!: string | null;
  @ApiProperty({ nullable: true }) socialTwitter!: string | null;
  @ApiProperty({ nullable: true }) socialGithub!: string | null;
  @ApiProperty({ nullable: true }) socialLinkedin!: string | null;
  @ApiProperty({ nullable: true }) socialInstagram!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(profile: Profile): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = profile.id;
    dto.userId = profile.userId;
    dto.displayName = profile.displayName;
    dto.coverUrl = profile.coverUrl;
    dto.bio = profile.bio;
    dto.jobTitle = profile.jobTitle;
    dto.company = profile.company;
    dto.location = profile.location;
    dto.socialWebsite = profile.socialWebsite;
    dto.socialTwitter = profile.socialTwitter;
    dto.socialGithub = profile.socialGithub;
    dto.socialLinkedin = profile.socialLinkedin;
    dto.socialInstagram = profile.socialInstagram;
    dto.createdAt = profile.createdAt;
    dto.updatedAt = profile.updatedAt;
    return dto;
  }
}
