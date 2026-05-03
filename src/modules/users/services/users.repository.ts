import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  Prisma,
  Profile,
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

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, preferences: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true, preferences: true },
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

  getUserProfile(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userId: id } });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        profile: { create: {} },
        preferences: { create: {} },
      },
      include: {
        profile: true,
        preferences: true,
      },
    });
  }

  updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const createData: Prisma.ProfileUncheckedCreateWithoutUserInput = {};
    const updateData: Prisma.ProfileUpdateInput = {};

    if (data.displayName !== undefined) {
      createData.displayName = data.displayName;
      updateData.displayName = data.displayName;
    }
    if (data.bio !== undefined) {
      createData.bio = data.bio;
      updateData.bio = data.bio;
    }
    if (data.coverUrl !== undefined) {
      createData.coverUrl = data.coverUrl;
      updateData.coverUrl = data.coverUrl;
    }
    if (data.jobTitle !== undefined) {
      createData.jobTitle = data.jobTitle;
      updateData.jobTitle = data.jobTitle;
    }
    if (data.company !== undefined) {
      createData.company = data.company;
      updateData.company = data.company;
    }
    if (data.location !== undefined) {
      createData.location = data.location;
      updateData.location = data.location;
    }
    if (data.socialWebsite !== undefined) {
      createData.socialWebsite = data.socialWebsite;
      updateData.socialWebsite = data.socialWebsite;
    }
    if (data.socialTwitter !== undefined) {
      createData.socialTwitter = data.socialTwitter;
      updateData.socialTwitter = data.socialTwitter;
    }
    if (data.socialGithub !== undefined) {
      createData.socialGithub = data.socialGithub;
      updateData.socialGithub = data.socialGithub;
    }
    if (data.socialLinkedin !== undefined) {
      createData.socialLinkedin = data.socialLinkedin;
      updateData.socialLinkedin = data.socialLinkedin;
    }
    if (data.socialInstagram !== undefined) {
      createData.socialInstagram = data.socialInstagram;
      updateData.socialInstagram = data.socialInstagram;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          upsert: {
            create: createData,
            update: updateData,
          },
        },
      },
      include: { profile: true, preferences: true },
    });
  }

  async updatePreferences(id: string, data: UpdatePreferencesData): Promise<UserPreference> {
    const existing = await this.prisma.userPreference.findUnique({ where: { userId: id } });
    if (!existing) throw new NotFoundException("User preferences not found");

    const update: Prisma.UserPreferenceUpdateInput = {};
    if (data.theme !== undefined) update.theme = data.theme;
    if (data.background !== undefined) update.background = data.background;
    if (data.density !== undefined) update.density = data.density;
    if (data.language !== undefined) update.language = data.language;
    if (data.timezone !== undefined) update.timezone = data.timezone;
    if (data.timeFormat !== undefined) update.timeFormat = data.timeFormat;
    if (data.dateFormat !== undefined) update.dateFormat = data.dateFormat;
    if (data.reducedMotion !== undefined) update.reducedMotion = data.reducedMotion;
    if (data.showCompletedCards !== undefined) update.showCompletedCards = data.showCompletedCards;
    if (data.emailEnabled !== undefined) update.emailEnabled = data.emailEnabled;
    if (data.pushEnabled !== undefined) update.pushEnabled = data.pushEnabled;
    if (data.mentions !== undefined) update.mentions = data.mentions;
    if (data.cardAssigned !== undefined) update.cardAssigned = data.cardAssigned;
    if (data.cardDueSoon !== undefined) update.cardDueSoon = data.cardDueSoon;
    if (data.boardInvites !== undefined) update.boardInvites = data.boardInvites;
    if (data.weeklyDigest !== undefined) update.weeklyDigest = data.weeklyDigest;
    if (data.profileVisibility !== undefined) update.profileVisibility = data.profileVisibility;
    if (data.showEmail !== undefined) update.showEmail = data.showEmail;
    if (data.showActivity !== undefined) update.showActivity = data.showActivity;
    if (data.allowDM !== undefined) update.allowDM = data.allowDM;
    if (data.analyticsOptOut !== undefined) update.analyticsOptOut = data.analyticsOptOut;

    return this.prisma.userPreference.update({
      where: { userId: id },
      data: update,
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
