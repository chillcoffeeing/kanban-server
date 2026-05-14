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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import type { AuthUser } from "@modules/auth/interfaces/auth-user.interface";
import { BoardPermissionGuard } from "@modules/members/guards/board-permission.guard";
import {
  RequireBoardPermission,
  RequireBoardRole,
} from "@modules/members/decorators/board-permission.decorator";
import { BoardAccessService } from "@modules/members/services/board-access.service";
import { StagesService } from "@modules/stages/services/stages.service";
import { RealtimeService } from "@infrastructure/realtime/realtime.service";
import { REALTIME_EVENTS } from "@infrastructure/realtime/events.constants";
import { CardsService } from "../services/cards.service";
import { CreateCardDto } from "../dto/create-card.dto";
import { UpdateCardDto, UpdateMembersDto } from "../dto/update-card.dto";
import { MoveCardDto } from "../dto/move-card.dto";
import { CardResponseDto } from "../dto/card-response.dto";

@ApiTags("cards")
@ApiBearerAuth()
@Controller()
export class CardsController {
  constructor(
    private readonly cards: CardsService,
    private readonly stages: StagesService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  @Post("stages/:id/cards")
  async create(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) stageId: string,
    @Body() dto: CreateCardDto,
  ): Promise<CardResponseDto> {
    const stage = await this.stages.getById(stageId);
    await this.access.requirePermission(stage.boardId, user.id, "create_card");
    const card = await this.cards.create(stageId, dto);
    const res = CardResponseDto.fromEntity(card);
    this.realtime.cardChanged(stage.boardId, REALTIME_EVENTS.CARD_CREATED, res);
    return res;
  }

  @Post("cards/:id/members")
  async addMember(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateMembersDto,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, "invite_member");
    await this.cards.updateMembers({
      action: "addMember",
      cardId,
      boardMembershipId: dto.boardMembershipId,
    });
    const card = await this.cards.getById(cardId); // Refetch with members
    const res = CardResponseDto.fromEntity(card);
    this.realtime.cardChanged(boardId, REALTIME_EVENTS.CARD_MEMBER_ADDED, res);
    return res;
  }

  @Delete("cards/:id/members/:boardMembershipId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) cardId: string,
    @Param("boardMembershipId", ParseUUIDPipe) boardMembershipId: string,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    await this.access.requirePermission(boardId, user.id, "invite_member");
    await this.cards.updateMembers({
      action: "removeMember",
      cardId,
      boardMembershipId: boardMembershipId,
    });
    const card = await this.cards.getById(cardId); // Refetch with members
    const res = CardResponseDto.fromEntity(card);
    this.realtime.cardChanged(
      boardId,
      REALTIME_EVENTS.CARD_MEMBER_REMOVED,
      res,
    );
    return res;
  }

  @Get("cards/:id")
  async get(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(id);
    await this.access.requireMembership(boardId, user.id);
    const card = await this.cards.getById(id);
    return CardResponseDto.fromEntity(card);
  }

  @Patch("cards/:id")
  async update(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(id);
    await this.access.requirePermission(boardId, user.id, "modify_card");
    const card = await this.cards.update(id, dto);
    const res = CardResponseDto.fromEntity(card);
    this.realtime.cardChanged(boardId, REALTIME_EVENTS.CARD_UPDATED, res);
    return res;
  }

  @Patch("cards/:id/move")
  async move(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MoveCardDto,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(id);
    await this.access.requirePermission(boardId, user.id, "modify_card");
    const card = await this.cards.move(id, dto.stageId, dto.index);
    const res = CardResponseDto.fromEntity(card);
    this.realtime.cardChanged(boardId, REALTIME_EVENTS.CARD_MOVED, res);
    return res;
  }

  @Delete("cards/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    const boardId = await this.cards.getBoardIdForCard(id);
    await this.access.requirePermission(boardId, user.id, "delete_card");
    await this.cards.delete(id);
    this.realtime.cardChanged(boardId, REALTIME_EVENTS.CARD_DELETED, {
      id,
      boardId,
    });
  }

  @Get("boards/:id/cards/search")
  @UseGuards(BoardPermissionGuard)
  @RequireBoardRole("owner", "member")
  async search(
    @Param("id", ParseUUIDPipe) boardId: string,
    @Query("q") q: string,
  ): Promise<CardResponseDto[]> {
    if (!q || q.trim().length < 2) return [];
    const rows = await this.cards.search(boardId, q.trim());
    return rows.map(CardResponseDto.fromEntity);
  }
}
