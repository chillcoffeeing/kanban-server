import { ApiProperty } from "@nestjs/swagger";
import type { User, Profile, UserPreference } from "@/generated/prisma/client";

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: [String] }) roles!: string[];
  @ApiProperty({ type: Object }) profile?: Profile;
  @ApiProperty({ type: Object }) preferences?: UserPreference;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ nullable: true }) lastLoginAt!: Date | null;

  static fromEntity(
    user: User & { profile?: Profile | null; preferences?: UserPreference },
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      profile: user.profile || undefined,
      preferences: user.preferences || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
