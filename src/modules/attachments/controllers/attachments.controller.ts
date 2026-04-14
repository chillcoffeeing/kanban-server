import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardAccessService } from '@modules/members/services/board-access.service';
import { CardsService } from '@modules/cards/services/cards.service';
import { RealtimeService } from '@infrastructure/realtime/realtime.service';
import { AttachmentsService } from '../services/attachments.service';
import { AttachmentResponseDto } from '../dto/attachment-response.dto';

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('attachments')
@ApiBearerAuth()
@Controller()
export class AttachmentsController {
  constructor(
    private readonly attachments: AttachmentsService,
    private readonly cards: CardsService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get('cards/:id/attachments')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
  ): Promise<AttachmentResponseDto[]> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requireMembership(boardId, user.id);
    const rows = await this.attachments.listByCard(cardId);
    return rows.map(AttachmentResponseDto.fromEntity);
  }

  @Post('cards/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  async upload(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) cardId: string,
    @UploadedFile() file: MulterFile,
  ): Promise<AttachmentResponseDto> {
    if (!file) throw new BadRequestException("Missing 'file' field");
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    const att = await this.attachments.upload(cardId, user.id, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
    const res = AttachmentResponseDto.fromEntity(att);
    this.realtime.attachmentChanged(boardId, { cardId, action: 'created', attachment: res });
    return res;
  }

  @Delete('attachments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const att = await this.attachments.getById(id);
    const boardId = await this.cards.getBoardIdForCard(att.cardId);
    await this.access.requirePermission(boardId, user.id, 'modify_card');
    await this.attachments.delete(id);
    this.realtime.attachmentChanged(boardId, {
      cardId: att.cardId,
      action: 'deleted',
      attachmentId: id,
    });
  }
}
