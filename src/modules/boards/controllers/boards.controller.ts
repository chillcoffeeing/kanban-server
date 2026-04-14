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
import { RealtimeService } from '@infrastructure/realtime/realtime.service';
import { BoardsService } from '../services/boards.service';
import { StagesService } from '@modules/stages/services/stages.service';
import { CardsService } from '@modules/cards/services/cards.service';
import { MembersService } from '@modules/members/services/members.service';
import { StageResponseDto } from '@modules/stages/dto/stage-response.dto';
import { CardResponseDto } from '@modules/cards/dto/card-response.dto';
import { MemberResponseDto } from '@modules/members/dto/member-response.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { BoardResponseDto } from '../dto/board-response.dto';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly boards: BoardsService,
    private readonly stages: StagesService,
    private readonly cards: CardsService,
    private readonly members: MembersService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthUser): Promise<BoardResponseDto[]> {
    const rows = await this.boards.listForUser(user.id);
    return rows.map(BoardResponseDto.fromEntity);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    const board = await this.boards.create(user.id, dto);
    return BoardResponseDto.fromEntity(board);
  }

  @Get(':id')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner', 'admin', 'member')
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<BoardResponseDto> {
    const board = await this.boards.getById(id);
    return BoardResponseDto.fromEntity(board);
  }

  @Get(':id/full')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner', 'admin', 'member')
  async getFull(@Param('id', ParseUUIDPipe) id: string): Promise<{
    board: BoardResponseDto;
    members: MemberResponseDto[];
    stages: (StageResponseDto & { cards: CardResponseDto[] })[];
  }> {
    const [board, stages, cards, members] = await Promise.all([
      this.boards.getById(id),
      this.stages.listByBoard(id),
      this.cards.listByBoard(id),
      this.members.listByBoard(id),
    ]);
    const cardsByStage = new Map<string, CardResponseDto[]>();
    for (const c of cards) {
      const arr = cardsByStage.get(c.stageId) ?? [];
      arr.push(CardResponseDto.fromEntity(c));
      cardsByStage.set(c.stageId, arr);
    }
    return {
      board: BoardResponseDto.fromEntity(board),
      members: members.map(MemberResponseDto.fromEntity),
      stages: stages.map((s) => ({
        ...StageResponseDto.fromEntity(s),
        cards: cardsByStage.get(s.id) ?? [],
      })),
    };
  }

  @Patch(':id')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardPermission('modify_board')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    const board = await this.boards.update(id, dto);
    const res = BoardResponseDto.fromEntity(board);
    this.realtime.boardUpdated(board.id, res);
    return res;
  }

  @Patch(':id/preferences')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner', 'admin', 'member')
  async updatePrefs(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<BoardResponseDto> {
    const board = await this.boards.update(id, { preferences: dto.preferences });
    const res = BoardResponseDto.fromEntity(board);
    this.realtime.boardUpdated(board.id, res);
    return res;
  }

  @Delete(':id')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.realtime.boardDeleted(id);
    await this.boards.delete(id);
  }
}
