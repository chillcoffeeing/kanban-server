import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardAccessService } from '@modules/members/services/board-access.service';
import { CardsService } from '@modules/cards/services/cards.service';
import { RealtimeService } from '@infrastructure/realtime/realtime.service';
import { ChecklistService } from '../services/checklist.service';
import {
  ChecklistItemResponseDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from '../dto/checklist.dto';

@ApiTags('checklist')
@ApiBearerAuth()
@Controller()
export class ChecklistController {
  constructor(
    private readonly checklist: ChecklistService,
    private readonly cards: CardsService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  private notifyChange(boardId: string, cardId: string, action: string, payload: unknown): void {
    this.realtime.checklistChanged(boardId, { cardId, action, payload });
  }

  @Get('cards/:id/checklist')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
  ): Promise<ChecklistItemResponseDto[]> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requireMembership(boardId, user.id);
    const rows = await this.checklist.listByCard(cardId);
    return rows.map(ChecklistItemResponseDto.fromEntity);
  }

  @Post('cards/:id/checklist')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Body() dto: CreateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    const item = await this.checklist.create(cardId, dto.text);
    const res = ChecklistItemResponseDto.fromEntity(item);
    this.notifyChange(boardId, cardId, 'created', res);
    return res;
  }

  @Patch('cards/:id/checklist/:itemId')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    const item = await this.checklist.update(itemId, dto);
    const res = ChecklistItemResponseDto.fromEntity(item);
    this.notifyChange(boardId, cardId, 'updated', res);
    return res;
  }

  @Delete('cards/:id/checklist/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    await this.checklist.delete(itemId);
    this.notifyChange(boardId, cardId, 'deleted', { itemId });
  }
}
