import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { PasswordHasherService } from '@modules/auth/services/password-hasher.service';
import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasherService,
  ) {}

  @Get('account')
  async account(@CurrentUser() current: AuthUser): Promise<UserResponseDto> {
    const user = await this.users.getById(current.id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch('account')
  async updateAccount(
    @CurrentUser() current: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updated = await this.users.updateProfile(current.id, dto);
    return UserResponseDto.fromEntity(updated);
  }

  @Patch('account/password')
  async changePassword(
    @CurrentUser() current: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const user = await this.users.getById(current.id);
    const ok = await this.hasher.verify(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is invalid');
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('New password must differ from current');
    }
    const hash = await this.hasher.hash(dto.newPassword);
    await this.users.updatePasswordHash(current.id, hash);
    return { success: true };
  }

  @Get()
  async search(@Query('email') email?: string): Promise<UserResponseDto[]> {
    if (!email || email.length < 2) return [];
    const found = await this.users.searchByEmail(email);
    return found.map(UserResponseDto.fromEntity);
  }
}
