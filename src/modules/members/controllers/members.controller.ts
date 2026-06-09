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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';
import { BoardPermissionGuard } from '../guards/board-permission.guard';
import {
  BoardIdFromParam,
  RequireBoardPermission,
  RequireBoardRole,
} from '../decorators/board-permission.decorator';
import { DOMAIN_EVENTS } from '@shared/events/domain.events';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('members')
  @RequireBoardRole('owner', 'member')
  async list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ): Promise<MemberResponseDto[]> {
    const rows = await this.members.listByBoard(boardId);
    return rows.map(MemberResponseDto.fromEntity);
  }

  @Patch('members/:membershipId')
  @RequireBoardRole('owner')
  async update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const updated = await this.members.updateById(membershipId, dto);
    const res = MemberResponseDto.fromEntity(updated);
    this.eventEmitter.emit(DOMAIN_EVENTS.MEMBER_ROLE_CHANGED, {
      boardId,
      data: res,
    });
    return res;
  }

  @Delete('members/:membershipId')
  @RequireBoardRole('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ): Promise<void> {
    const member = await this.members.findByUserAndBoard(boardId, user.id);
    const target = await this.members.listByBoard(boardId);
    const targetMember = target.find((m: any) => m.id === membershipId);
    await this.members.removeById(membershipId);
    this.eventEmitter.emit(DOMAIN_EVENTS.MEMBER_LEFT, {
      boardId,
      membershipId: member.id,
      userName: user.name,
      memberId: membershipId,
      memberName: targetMember?.user?.name || targetMember?.email || membershipId,
    });
  }
}
