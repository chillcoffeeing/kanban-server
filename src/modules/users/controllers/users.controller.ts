import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import type { AuthUser } from "@modules/auth/interfaces/auth-user.interface";
import { PasswordHasherService } from "@modules/auth/services/password-hasher.service";
import { UsersService } from "../services/users.service";
import { UserResponseDto } from "../dto/user-response.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { UpdatePreferencesDto } from "../dto/update-preferences.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { PreferencesResponseDto } from "../dto/preferences-response.dto";
import { ProfileResponseDto } from "../dto/profile-response.dto";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasherService,
  ) {}

  @Get("account")
  async account(@CurrentUser() current: AuthUser): Promise<UserResponseDto> {
    const user = await this.users.getById(current.id);
    return UserResponseDto.fromEntity(user);
  }

  @Get("preferences")
  async getPreferences(
    @CurrentUser() current: AuthUser,
  ): Promise<PreferencesResponseDto | { message: string }> {
    const preferences = await this.users.getPreferences(current.id);
    if (!preferences) return { message: "Preferences not found" };
    return PreferencesResponseDto.fromEntity(preferences);
  }

  @Get("profile")
  async getProfile(@CurrentUser() current: AuthUser): Promise<ProfileResponseDto | { message: string }> {
    const profile = await this.users.getProfile(current.id);
    if (!profile) return { message: "Profile not found" };
    return ProfileResponseDto.fromEntity(profile);
  }

  @Get(":id")
  async getUserById(@Param("id") id: string): Promise<UserResponseDto | { message: string }> {
    const user = await this.users.getById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch("account")
  async updateAccount(
    @CurrentUser() current: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updated = await this.users.updateProfile(current.id, dto);
    return UserResponseDto.fromEntity(updated);
  }

  @Patch("preferences")
  async updatePreferences(
    @CurrentUser() current: AuthUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<PreferencesResponseDto> {
    const updated = await this.users.updatePreferences(current.id, dto);
    return PreferencesResponseDto.fromEntity(updated);
  }

  @Patch("account/password")
  async changePassword(
    @CurrentUser() current: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const user = await this.users.getById(current.id);
    const ok = await this.hasher.verify(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Current password is invalid");
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException("New password must differ from current");
    }
    const hash = await this.hasher.hash(dto.newPassword);
    await this.users.updatePasswordHash(current.id, hash);
    return { success: true };
  }

  @Get()
  async search(@Query("email") email?: string): Promise<UserResponseDto[]> {
    if (!email || email.length < 2) return [];
    const found = await this.users.searchByEmail(email);
    return found.map(UserResponseDto.fromEntity);
  }
}
