import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import type { AuthUser } from "@modules/auth/interfaces/auth-user.interface";
import { BoardPermissionGuard } from "@modules/members/guards/board-permission.guard";
import { BoardIdFromParam, RequireBoardRole } from "@modules/members/decorators/board-permission.decorator";
import { PermissionRequestsService } from "../services/permission-requests.service";
import {
  CreatePermissionRequestDto,
  UpdatePermissionRequestDto,
  PermissionRequestResponseDto,
} from "../dto/permission-request.dto";

@ApiTags("permission-requests")
@ApiBearerAuth()
@BoardIdFromParam("boardId")
@Controller()
export class PermissionRequestsController {
  constructor(private readonly permissionRequests: PermissionRequestsService) {}

  @Post("boards/:boardId/permission-requests")
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePermissionRequestDto,
  ): Promise<PermissionRequestResponseDto> {
    const request = await this.permissionRequests.create(boardId, user.id, dto.permission);
    return PermissionRequestResponseDto.fromEntity(request);
  }

  @Get("boards/:boardId/permission-requests")
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole("owner")
  async listPending(
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ): Promise<PermissionRequestResponseDto[]> {
    const requests = await this.permissionRequests.findPendingByBoard(boardId);
    return requests.map((r) => PermissionRequestResponseDto.fromEntity(r));
  }

  @Patch("boards/:boardId/permission-requests/:id")
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole("owner")
  async updateStatus(
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePermissionRequestDto,
  ): Promise<PermissionRequestResponseDto> {
    const request = await this.permissionRequests.updateStatus(
      id,
      boardId,
      user.id,
      dto.status,
    );
    return PermissionRequestResponseDto.fromEntity(request);
  }
}
