import type {
  UserProfile,
  User,
  UserPreference,
} from "@/generated/prisma/client";
import type {
  UserProfileJson,
  UserPreferencesSettingsJson,
} from "./settings-json.types";

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  username?: string;
  profile?: Partial<UserProfileJson>;
}

export interface UpdateProfileData {
  profile?: UserProfileJson;
}

export interface UpdatePreferencesData {
  settings?: UserPreferencesSettingsJson;
}

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  searchByEmail(query: string, limit?: number): Promise<User[]>;
  getUserPreprences(id: string): Promise<UserPreference | null>;
  getUserProfile(id: string): Promise<UserProfile | null>;
  create(data: CreateUserData): Promise<User>;
  updateProfile(id: string, data: UpdateProfileData): Promise<User>;
  updatePreferences(
    id: string,
    data: UpdatePreferencesData,
  ): Promise<UserPreference>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  touchLastLogin(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");
