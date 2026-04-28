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
import { BoardAccessService } from '@modules/members/services/board-access.service';
import { CardsService } from '@modules/cards/services/cards.service';
import { LabelsService } from '../services/labels.service';
import { CreateLabelDto } from '../dto/create-label.dto';
import { LabelResponseDto } from '../dto/label-response.dto';

@ApiTags('labels')
@ApiBearerAuth()
@Controller()
export class LabelsController {
  constructor(
    private readonly labels: LabelsService,
    private readonly cards: CardsService,
    private readonly access: BoardAccessService,
  ) {}

  @Get('boards/:id/labels')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner', 'admin', 'member')
  async listByBoard(
    @Param('id', ParseUUIDPipe) boardId: string,
  ): Promise<LabelResponseDto[]> {
    const rows = await this.labels.listByBoard(boardId);
    return rows.map(LabelResponseDto.fromEntity);
  }

  @Post('boards/:id/labels')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner')
  async create(
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateLabelDto,
  ): Promise<LabelResponseDto> {
    const label = await this.labels.create(boardId, dto);
    return LabelResponseDto.fromEntity(label);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const boardId = await this.labels.getBoardIdForLabel(id);
    await this.access.requireRole(boardId, user.id, ['owner']);
    await this.labels.delete(id);
  }

  @Get('cards/:id/labels')
  async listByCard(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
  ): Promise<LabelResponseDto[]> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requireMembership(boardId, user.id);
    const rows = await this.labels.listByCard(cardId);
    return rows.map(LabelResponseDto.fromEntity);
  }

  @Post('cards/:id/labels/:labelId')
  async attach(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<{ success: true }> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    await this.labels.attach(cardId, labelId, boardId);
    return { success: true };
  }

  @Delete('cards/:id/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async detach(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<void> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    await this.labels.detach(cardId, labelId);
  }
}
