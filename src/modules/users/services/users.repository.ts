import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  Prisma,
  UserProfile,
  User,
  UserPreference,
} from "@/generated/prisma/client";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import type {
  CreateUserData,
  IUsersRepository,
  UpdateProfileData,
  UpdatePreferencesData,
} from "../interfaces/users-repository.interface";
import {
  DEFAULT_PREFERENCES_SETTINGS_JSON,
  DEFAULT_PROFILE_JSON,
  UserPreferencesSettingsJson,
  UserProfileJson,
} from "../interfaces/settings-json.types";

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, preference: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true, preference: true },
    });
  }

  searchByEmail(query: string, limit = 10): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { email: { contains: query.toLowerCase(), mode: "insensitive" } },
      take: limit,
      orderBy: { email: "asc" },
    });
  }

  getUserPreprences(id: string): Promise<UserPreference | null> {
    return this.prisma.userPreference.findUnique({ where: { userId: id } });
  }

  getUserProfile(id: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({ where: { userId: id } });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        profile: {
          create: { profile: DEFAULT_PROFILE_JSON as Prisma.InputJsonValue },
        },
        preference: {
          create: {
            settings:
              DEFAULT_PREFERENCES_SETTINGS_JSON as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        profile: true,
        preference: true,
      },
    });
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userId: id },
    });

    const currentProfile = (existing?.profile as UserProfileJson) ?? {};
    const newProfile = { ...currentProfile, ...(data.profile ?? {}) };

    return this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          upsert: {
            create: { profile: newProfile as Prisma.InputJsonValue },
            update: { profile: newProfile as Prisma.InputJsonValue },
          },
        },
      },
      include: { profile: true, preference: true },
    });
  }

  async updatePreferences(
    id: string,
    data: UpdatePreferencesData,
  ): Promise<UserPreference> {
    const existing = await this.prisma.userPreference.findUnique({
      where: { userId: id },
    });
    if (!existing) throw new NotFoundException("User preferences not found");

    const currentSettings =
      (existing.settings as UserPreferencesSettingsJson) ?? {};
    const newSettings = { ...currentSettings, ...(data.settings ?? {}) };

    return this.prisma.userPreference.update({
      where: { userId: id },
      data: { settings: newSettings as Prisma.InputJsonValue },
    });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
