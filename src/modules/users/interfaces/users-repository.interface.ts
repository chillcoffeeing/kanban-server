import type { Profile, User, UserPreference } from "@/generated/prisma/client";

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  coverUrl?: string | null;
  jobTitle?: string;
  company?: string;
  location?: string;
  socialWebsite?: string | null;
  socialTwitter?: string | null;
  socialGithub?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
}

export interface UpdatePreferencesData {
  theme?: string;
  background?: string;
  density?: string;
  language?: string;
  timezone?: string;
  timeFormat?: string;
  dateFormat?: string;
  reducedMotion?: boolean;
  showCompletedCards?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  mentions?: boolean;
  cardAssigned?: boolean;
  cardDueSoon?: boolean;
  boardInvites?: boolean;
  weeklyDigest?: boolean;
  profileVisibility?: string;
  showEmail?: boolean;
  showActivity?: boolean;
  allowDM?: boolean;
  analyticsOptOut?: boolean;
}

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  searchByEmail(query: string, limit?: number): Promise<User[]>;
  getUserPreprences(id: string): Promise<UserPreference | null>;
  getUserProfile(id: string): Promise<Profile | null>;
  create(data: CreateUserData): Promise<User>;
  updateProfile(id: string, data: UpdateProfileData): Promise<User>;
  updatePreferences(id: string, data: UpdatePreferencesData): Promise<UserPreference>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  touchLastLogin(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");
