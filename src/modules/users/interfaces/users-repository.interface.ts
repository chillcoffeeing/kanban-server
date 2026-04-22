import type { User } from '@/generated/prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string | null;
  profile?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  searchByEmail(query: string, limit?: number): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  updateProfile(id: string, data: UpdateProfileData): Promise<User>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  touchLastLogin(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
