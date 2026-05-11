import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  UserProfile,
  User,
  UserPreference,
} from "@/generated/prisma/client";
import {
  IUsersRepository,
  USERS_REPOSITORY,
  type CreateUserData,
  type UpdateProfileData,
  type UpdatePreferencesData,
} from "../interfaces/users-repository.interface";
import {
  DEFAULT_PREFERENCES_SETTINGS_JSON,
  DEFAULT_PROFILE_JSON,
  UserPreferencesSettingsJson,
  UserProfileJson,
} from "../interfaces/settings-json.types";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: IUsersRepository,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  searchByEmail(query: string): Promise<User[]> {
    return this.users.searchByEmail(query);
  }

  getPreferences(id?: string): Promise<UserPreference | null> {
    if (!id) throw new NotFoundException("User ID is required");
    return this.users.getUserPreprences(id);
  }
  getProfile(id?: string): Promise<UserProfile | null> {
    if (!id) throw new NotFoundException("User ID is required");
    return this.users.getUserProfile(id);
  }

  create(data: CreateUserData): Promise<User> {
    return this.users.create(data);
  }

  updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    return this.users.updateProfile(id, data);
  }

  updatePreferences(
    id: string,
    data: UpdatePreferencesData,
  ): Promise<UserPreference> {
    return this.users.updatePreferences(id, data);
  }

  updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    return this.users.updatePasswordHash(id, passwordHash);
  }

  touchLastLogin(id: string): Promise<void> {
    return this.users.touchLastLogin(id);
  }

  getDefaultProfile(): UserProfileJson {
    return { ...DEFAULT_PROFILE_JSON };
  }

  getDefaultPreferences(): UserPreferencesSettingsJson {
    return { ...DEFAULT_PREFERENCES_SETTINGS_JSON };
  }
}
