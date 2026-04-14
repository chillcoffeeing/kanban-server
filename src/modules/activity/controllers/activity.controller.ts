import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardPermissionGuard } from '@modules/members/guards/board-permission.guard';
import { RequireBoardRole } from '@modules/members/decorators/board-permission.decorator';
import { ActivityService } from '../services/activity.service';
import { ActivityResponseDto, ListActivityQueryDto } from '../dto/activity.dto';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('boards/:id/activity')
@UseGuards(BoardPermissionGuard)
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  @RequireBoardRole('owner', 'admin', 'member')
  async list(
    @Param('id', ParseUUIDPipe) boardId: string,
    @Query() query: ListActivityQueryDto,
  ): Promise<ActivityResponseDto[]> {
    const rows = await this.activity.listByBoard(boardId, {
      limit: query.limit,
      before: query.before,
    });
    return rows.map(ActivityResponseDto.fromEntity);
  }
}
