import { ApiProperty } from "@nestjs/swagger";
import type {
  User,
  UserProfile,
  UserPreference,
} from "@/generated/prisma/client";

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() avatarUrl!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: Object }) profile?: UserProfile;
  @ApiProperty({ type: Object }) preference?: UserPreference;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ nullable: true }) lastLoginAt!: Date | null;

  static fromEntity(
    user: User & { profile?: UserProfile; preference?: UserPreference },
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
      name: user.name,
      profile: user.profile || undefined,
      preference: user.preference || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
