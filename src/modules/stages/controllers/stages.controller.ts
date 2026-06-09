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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardPermissionGuard } from '@modules/members/guards/board-permission.guard';
import {
  RequireBoardPermission,
} from '@modules/members/decorators/board-permission.decorator';
import { BoardAccessService } from '@modules/members/services/board-access.service';
import { DOMAIN_EVENTS } from '@shared/events/domain.events';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('boards/:id/stages')
  @UseGuards(BoardPermissionGuard)
  @RequireBoardPermission('create_stage')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateStageDto,
  ): Promise<StageResponseDto> {
    const membership = await this.access.requirePermission(boardId, user.id, 'create_stage');
    const stage = await this.stages.create(boardId, dto.name);
    const res = StageResponseDto.fromEntity(stage);
    this.eventEmitter.emit(DOMAIN_EVENTS.STAGE_CREATED, {
      boardId,
      membershipId: membership.id,
      userName: user.name,
      stageId: stage.id,
      name: dto.name,
      data: res,
    });
    return res;
  }

  @Patch('stages/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStageDto,
  ): Promise<StageResponseDto> {
    const old = await this.stages.getById(id);
    const membership = await this.access.requireRole(old.boardId, user.id, ['owner']);
    const updated = await this.stages.update(id, dto);
    const res = StageResponseDto.fromEntity(updated);

    if (dto.position !== undefined) {
      this.eventEmitter.emit(DOMAIN_EVENTS.STAGE_REORDERED, {
        boardId: old.boardId,
        data: res,
      });
    } else if (dto.name && dto.name !== old.name) {
      this.eventEmitter.emit(DOMAIN_EVENTS.STAGE_UPDATED, {
        boardId: old.boardId,
        membershipId: membership.id,
        userName: user.name,
        stageId: id,
        oldName: old.name,
        newName: dto.name,
        data: res,
      });
    } else {
      this.eventEmitter.emit(DOMAIN_EVENTS.STAGE_UPDATED, {
        boardId: old.boardId,
        data: res,
      });
    }

    return res;
  }

  @Delete('stages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const stage = await this.stages.getById(id);
    const membership = await this.access.requireRole(stage.boardId, user.id, ['owner']);
    await this.stages.delete(id);
    this.eventEmitter.emit(DOMAIN_EVENTS.STAGE_DELETED, {
      boardId: stage.boardId,
      membershipId: membership.id,
      userName: user.name,
      stageId: id,
      name: stage.name,
    });
  }
}
