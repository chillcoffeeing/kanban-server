import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

const THEME_VALUES = ['light', 'dark', 'midnight', 'solarized', 'system'] as const;
const DENSITY_VALUES = ['comfortable', 'compact'] as const;
const LANGUAGE_VALUES = ['es', 'en'] as const;
const TIME_FORMAT_VALUES = ['12h', '24h'] as const;
const DATE_FORMAT_VALUES = ['DMY', 'MDY', 'YMD'] as const;
const VISIBILITY_VALUES = ['public', 'workspace', 'private'] as const;

export class UpdatePreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(THEME_VALUES)
  theme?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  background?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(DENSITY_VALUES)
  density?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(LANGUAGE_VALUES)
  language?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  timezone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(TIME_FORMAT_VALUES)
  timeFormat?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(DATE_FORMAT_VALUES)
  dateFormat?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  reducedMotion?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  showCompletedCards?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  mentions?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  cardAssigned?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  cardDueSoon?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  boardInvites?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  weeklyDigest?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() @IsIn(VISIBILITY_VALUES)
  profileVisibility?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  showEmail?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  showActivity?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  allowDM?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  analyticsOptOut?: boolean;
}
