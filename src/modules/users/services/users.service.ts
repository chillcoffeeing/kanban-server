import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@/generated/prisma/client';
import {
  IUsersRepository,
  USERS_REPOSITORY,
  type CreateUserData,
  type UpdateProfileData,
} from '../interfaces/users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: IUsersRepository,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  searchByEmail(query: string): Promise<User[]> {
    return this.users.searchByEmail(query);
  }

  create(data: CreateUserData): Promise<User> {
    return this.users.create(data);
  }

  updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    return this.users.updateProfile(id, data);
  }

  updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    return this.users.updatePasswordHash(id, passwordHash);
  }

  touchLastLogin(id: string): Promise<void> {
    return this.users.touchLastLogin(id);
  }
}
