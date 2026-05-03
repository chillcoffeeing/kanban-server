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
import { CommentsService } from '../services/comments.service';
import {
  CommentResponseDto,
  CreateCommentDto,
  UpdateCommentDto,
} from '../dto/comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly cards: CardsService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get('cards/:id/comments')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
  ): Promise<CommentResponseDto[]> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    const membership = await this.access.requireMembership(boardId, user.id);
    const rows = await this.comments.listByCard(cardId);
    return rows.map(CommentResponseDto.fromEntity);
  }

  @Post('cards/:id/comments')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    const membership = await this.access.requireMembership(boardId, user.id);
    const comment = await this.comments.create(cardId, membership.id, dto.body);
    const res = CommentResponseDto.fromEntity(comment);
    this.realtime.commentCreated(boardId, res);
    return res;
  }

  @Patch('comments/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const existing = await this.comments.getById(id);
    const boardId = await this.cards.getBoardIdForCard(existing.cardId);
    const membership = await this.access.requireMembership(boardId, user.id);
    const comment = await this.comments.update(id, membership.id, dto.body);
    return CommentResponseDto.fromEntity(comment);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const existing = await this.comments.getById(id);
    const boardId = await this.cards.getBoardIdForCard(existing.cardId);
    const membership = await this.access.requireMembership(boardId, user.id);
    await this.comments.delete(id, membership.id, membership.role === 'owner');
  }
}
