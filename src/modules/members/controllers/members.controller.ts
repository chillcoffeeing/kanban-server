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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardPermissionGuard } from '../guards/board-permission.guard';
import {
  BoardIdFromParam,
  RequireBoardPermission,
  RequireBoardRole,
} from '../decorators/board-permission.decorator';
import { RealtimeService } from '@infrastructure/realtime/realtime.service';
import { REALTIME_EVENTS } from '@infrastructure/realtime/events.constants';
import { MembersService } from '../services/members.service';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { MemberResponseDto } from '../dto/member-response.dto';

@ApiTags('members')
@ApiBearerAuth()
@Controller('boards/:boardId')
@UseGuards(BoardPermissionGuard)
@BoardIdFromParam('boardId')
export class MembersController {
  constructor(
    private readonly members: MembersService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get('members')
  @RequireBoardRole('owner', 'admin', 'member')
  async list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ): Promise<MemberResponseDto[]> {
    const rows = await this.members.listByBoard(boardId);
    return rows.map(MemberResponseDto.fromEntity);
  }

  @Patch('members/:userId')
  @RequireBoardRole('owner')
  async update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const updated = await this.members.update(boardId, userId, dto);
    const res = MemberResponseDto.fromEntity(updated);
    this.realtime.memberChanged(boardId, REALTIME_EVENTS.MEMBER_ROLE_CHANGED, res);
    return res;
  }

  @Delete('members/:userId')
  @RequireBoardRole('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.members.remove(boardId, userId);
    this.realtime.memberChanged(boardId, REALTIME_EVENTS.MEMBER_LEFT, { boardId, userId });
  }
}
