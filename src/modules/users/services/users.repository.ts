import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type {
  CreateUserData,
  IUsersRepository,
  UpdateProfileData,
} from '../interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  searchByEmail(query: string, limit = 10): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { email: { contains: query.toLowerCase(), mode: 'insensitive' } },
      take: limit,
      orderBy: { email: 'asc' },
    });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const update: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;
    if (data.profile !== undefined) update.profile = data.profile as Prisma.InputJsonValue;
    if (data.preferences !== undefined) {
      update.preferences = data.preferences as Prisma.InputJsonValue;
    }
    return this.prisma.user.update({ where: { id }, data: update });
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
