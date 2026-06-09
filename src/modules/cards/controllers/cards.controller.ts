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
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import type { AuthUser } from "@modules/auth/interfaces/auth-user.interface";
import { BoardPermissionGuard } from "@modules/members/guards/board-permission.guard";
import {
  RequireBoardPermission,
  RequireBoardRole,
} from "@modules/members/decorators/board-permission.decorator";
import { BoardAccessService } from "@modules/members/services/board-access.service";
import { StagesService } from "@modules/stages/services/stages.service";
import { DOMAIN_EVENTS } from "@shared/events/domain.events";
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post("stages/:id/cards")
  async create(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) stageId: string,
    @Body() dto: CreateCardDto,
  ): Promise<CardResponseDto> {
    const stage = await this.stages.getById(stageId);
    const membership = await this.access.requirePermission(stage.boardId, user.id, "create_card");
    const card = await this.cards.create(stageId, dto);
    const res = CardResponseDto.fromEntity(card);
    this.eventEmitter.emit(DOMAIN_EVENTS.CARD_CREATED, {
      boardId: stage.boardId,
      membershipId: membership.id,
      userName: user.name,
      cardId: card.id,
      title: dto.title,
      stageId,
      data: res,
    });
    return res;
  }

  @Post("cards/:id/members")
  async addMember(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateMembersDto,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(cardId);
    const membership = await this.access.requirePermission(boardId, user.id, "invite_member");
    await this.cards.updateMembers({
      action: "addMember",
      cardId,
      boardMembershipId: dto.boardMembershipId,
    });
    const card = await this.cards.getById(cardId);
    const res = CardResponseDto.fromEntity(card);
    this.eventEmitter.emit(DOMAIN_EVENTS.CARD_MEMBER_ADDED, {
      boardId,
      membershipId: membership.id,
      userName: user.name,
      cardId,
      cardTitle: card.title,
      memberName: "",
      data: res,
    });
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
    const membership = await this.access.requirePermission(boardId, user.id, "invite_member");
    await this.cards.updateMembers({
      action: "removeMember",
      cardId,
      boardMembershipId: boardMembershipId,
    });
    const card = await this.cards.getById(cardId);
    const res = CardResponseDto.fromEntity(card);
    this.eventEmitter.emit(DOMAIN_EVENTS.CARD_MEMBER_REMOVED, {
      boardId,
      membershipId: membership.id,
      userName: user.name,
      cardId,
      cardTitle: card.title,
      memberName: "",
      data: res,
    });
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
    const membership = await this.access.requirePermission(boardId, user.id, "modify_card");
    const card = await this.cards.update(id, dto);
    const res = CardResponseDto.fromEntity(card);
    const changes: Record<string, unknown> = {};
    if (dto.title !== undefined) changes.title = dto.title;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.startDate !== undefined) changes.startDate = dto.startDate;
    if (dto.dueDate !== undefined) changes.dueDate = dto.dueDate;
    if (Object.keys(changes).length > 0) {
      this.eventEmitter.emit(DOMAIN_EVENTS.CARD_UPDATED, {
        boardId,
        membershipId: membership.id,
        userName: user.name,
        cardId: id,
        title: card.title,
        changes,
        data: res,
      });
    }
    return res;
  }

  @Patch("cards/:id/move")
  async move(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MoveCardDto,
  ): Promise<CardResponseDto> {
    const boardId = await this.cards.getBoardIdForCard(id);
    const membership = await this.access.requirePermission(boardId, user.id, "modify_card");
    const oldCard = await this.cards.getById(id);
    const oldStage = await this.stages.getById(oldCard.stageId);
    const newStage = await this.stages.getById(dto.stageId);
    const card = await this.cards.move(id, dto.stageId, dto.index);
    const res = CardResponseDto.fromEntity(card);
    this.eventEmitter.emit(DOMAIN_EVENTS.CARD_MOVED, {
      boardId,
      membershipId: membership.id,
      userName: user.name,
      cardId: id,
      title: card.title,
      fromStage: oldStage.name,
      toStage: newStage.name,
      data: res,
    });
    return res;
  }

  @Delete("cards/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    const boardId = await this.cards.getBoardIdForCard(id);
    const membership = await this.access.requirePermission(boardId, user.id, "delete_card");
    const card = await this.cards.getById(id);
    await this.cards.delete(id);
    this.eventEmitter.emit(DOMAIN_EVENTS.CARD_DELETED, {
      boardId,
      membershipId: membership.id,
      userName: user.name,
      cardId: id,
      title: card.title,
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
