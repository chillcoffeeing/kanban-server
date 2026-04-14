import {
  Body,
  Controller,
  Delete,
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
} from '@modules/members/decorators/board-permission.decorator';
import { BoardAccessService } from '@modules/members/services/board-access.service';
import { RealtimeService } from '@infrastructure/realtime/realtime.service';
import { REALTIME_EVENTS } from '@infrastructure/realtime/events.constants';
import { StagesService } from '../services/stages.service';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { StageResponseDto } from '../dto/stage-response.dto';

@ApiTags('stages')
@ApiBearerAuth()
@Controller()
export class StagesController {
  constructor(
    private readonly stages: StagesService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  @Post('boards/:id/stages')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardPermission('create_stage')
  async create(
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateStageDto,
  ): Promise<StageResponseDto> {
    const stage = await this.stages.create(boardId, dto.name);
    const res = StageResponseDto.fromEntity(stage);
    this.realtime.stageChanged(boardId, REALTIME_EVENTS.STAGE_CREATED, res);
    return res;
  }

  @Patch('stages/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStageDto,
  ): Promise<StageResponseDto> {
    const stage = await this.stages.getById(id);
    await this.access.requirePermission(stage.boardId, user.id, 'modify_board');
    const updated = await this.stages.update(id, dto);
    const res = StageResponseDto.fromEntity(updated);
    const event =
      dto.position !== undefined ? REALTIME_EVENTS.STAGE_REORDERED : REALTIME_EVENTS.STAGE_UPDATED;
    this.realtime.stageChanged(stage.boardId, event, res);
    return res;
  }

  @Delete('stages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const stage = await this.stages.getById(id);
    await this.access.requirePermission(stage.boardId, user.id, 'modify_board');
    await this.stages.delete(id);
    this.realtime.stageChanged(stage.boardId, REALTIME_EVENTS.STAGE_DELETED, {
      id,
      boardId: stage.boardId,
    });
  }
}
