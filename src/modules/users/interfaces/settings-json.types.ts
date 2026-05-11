import { UpdatePreferencesDto } from "../dto/update-preferences.dto";

export interface UserProfileJson {
  displayName?: string;
  coverUrl?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  socialWebsite?: string | null;
  socialTwitter?: string | null;
  socialGithub?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
}

export const DEFAULT_PROFILE_JSON: UserProfileJson = {
  displayName: "",
  coverUrl: null,
  bio: null,
  jobTitle: null,
  company: null,
  location: null,
  socialWebsite: null,
  socialTwitter: null,
  socialGithub: null,
  socialLinkedin: null,
  socialInstagram: null,
};

const THEME_VALUES = ["light", "dark", "midnight", "solarized"] as const;

const DENSITY_VALUES = ["comfortable", "compact"] as const;

const LANGUAGE_VALUES = ["es", "en"] as const;

const TIME_FORMAT_VALUES = ["12h", "24h"] as const;

const DATE_FORMAT_VALUES = ["DMY", "MDY", "YMD"] as const;

const VISIBILITY_VALUES = ["public", "workspace", "private"] as const;

export interface UserPreferencesSettingsJson {
  theme?: (typeof THEME_VALUES)[number];
  background?: string;
  density?: (typeof DENSITY_VALUES)[number];
  language?: (typeof LANGUAGE_VALUES)[number];
  timezone?: string;
  timeFormat?: (typeof TIME_FORMAT_VALUES)[number];
  dateFormat?: (typeof DATE_FORMAT_VALUES)[number];
  reducedMotion?: boolean;
  showCompletedCards?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  mentions?: boolean;
  cardAssigned?: boolean;
  cardDueSoon?: boolean;
  boardInvites?: boolean;
  weeklyDigest?: boolean;
  profileVisibility?: (typeof VISIBILITY_VALUES)[number];
  showEmail?: boolean;
  showActivity?: boolean;
  allowDM?: boolean;
  analyticsOptOut?: boolean;
}

export const DEFAULT_PREFERENCES_SETTINGS_JSON: UserPreferencesSettingsJson = {
  theme: "light",
  background: "plain",
  density: "comfortable",
  language: "es",
  timezone: "",
  timeFormat: "24h",
  dateFormat: "DMY",
  reducedMotion: false,
  showCompletedCards: true,
  emailEnabled: true,
  pushEnabled: false,
  mentions: true,
  cardAssigned: true,
  cardDueSoon: true,
  boardInvites: true,
  weeklyDigest: false,
  profileVisibility: "workspace",
  showEmail: false,
  showActivity: true,
  allowDM: true,
  analyticsOptOut: false,
};

export type ThemeValue = UpdatePreferencesDto["settings"] extends {
  theme?: infer T;
}
  ? NonNullable<T>
  : never;
export type DensityValue = UpdatePreferencesDto["settings"] extends {
  density?: infer T;
}
  ? NonNullable<T>
  : never;
export type LanguageValue = UpdatePreferencesDto["settings"] extends {
  language?: infer T;
}
  ? NonNullable<T>
  : never;
export type TimeFormatValue = UpdatePreferencesDto["settings"] extends {
  timeFormat?: infer T;
}
  ? NonNullable<T>
  : never;
export type DateFormatValue = UpdatePreferencesDto["settings"] extends {
  dateFormat?: infer T;
}
  ? NonNullable<T>
  : never;
export type VisibilityValue = UpdatePreferencesDto["settings"] extends {
  profileVisibility?: infer T;
}
  ? NonNullable<T>
  : never;
