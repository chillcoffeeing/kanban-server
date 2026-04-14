import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ type: [String] }) roles!: string[];
  @ApiProperty({ type: Object }) profile!: Record<string, unknown>;
  @ApiProperty({ type: Object }) preferences!: Record<string, unknown>;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ nullable: true }) lastLoginAt!: Date | null;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      profile: user.profile as Record<string, unknown>,
      preferences: user.preferences as Record<string, unknown>,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
