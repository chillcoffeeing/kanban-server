import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardPermissionGuard } from '@modules/members/guards/board-permission.guard';
import {
  RequireBoardPermission,
  RequireBoardRole,
} from '@modules/members/decorators/board-permission.decorator';
import { InvitationsService } from '../services/invitations.service';
import {
  CreateInvitationDto,
  InvitationResponseDto,
} from '../dto/invitation.dto';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller()
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get('invitations/pending')
  @HttpCode(HttpStatus.OK)
  async getPending(@CurrentUser() user: AuthUser) {
    const rows = await this.invitations.getPendingForUser(user.email);
    return rows.map((i) => InvitationResponseDto.fromEntity(i));
  }

  @Delete('invitations/:id')
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.invitations.rejectInvitation(id, user.id);
    return { ok: true };
  }

  @Get('boards/:id/invitations')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardPermission('invite_member')
  async list(
    @Param('id', ParseUUIDPipe) boardId: string,
  ): Promise<InvitationResponseDto[]> {
    const rows = await this.invitations.listByBoard(boardId);
    return rows.map((i) => InvitationResponseDto.fromEntity(i));
  }

  @Post('boards/:id/invitations')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner')
  async create(
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: AuthUser,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitations.invite(
      boardId,
      dto.email,
      user.name,
      dto.role ?? 'member',
    );
    return InvitationResponseDto.fromEntity(invitation, true);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  async accept(
    @CurrentUser() user: AuthUser,
    @Param('token') token: string,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitations.accept(token, user.id);
    return InvitationResponseDto.fromEntity(invitation);
  }
}
