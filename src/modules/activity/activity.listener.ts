import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Prisma } from '@/generated/prisma/client';
import { ActivityService } from './services/activity.service';
import { DOMAIN_EVENTS } from '@shared/events/domain.events';

@Injectable()
export class ActivityListener {
  constructor(private readonly activity: ActivityService) {}

  @OnEvent(DOMAIN_EVENTS.BOARD_UPDATED)
  handleBoardRenamed(payload: { boardId: string; membershipId: string; userName: string; oldName: string; newName: string }) {
    if (!payload.oldName || !payload.newName || payload.oldName === payload.newName) return;
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'board_renamed',
      detail: `Renombró el tablero "${payload.oldName}" a "${payload.newName}"`,
      meta: { oldName: payload.oldName, newName: payload.newName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_CREATED)
  handleStageCreated(payload: { boardId: string; membershipId: string; userName: string; stageId: string; name: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'stage_created',
      detail: `Creó la etapa "${payload.name}"`,
      meta: { stageId: payload.stageId },
    });
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_UPDATED)
  handleStageRenamed(payload: { boardId: string; membershipId: string; userName: string; stageId: string; oldName: string; newName: string }) {
    if (!payload.oldName || !payload.newName || payload.oldName === payload.newName) return;
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'stage_renamed',
      detail: `Renombró la etapa "${payload.oldName}" a "${payload.newName}"`,
      meta: { stageId: payload.stageId, oldName: payload.oldName, newName: payload.newName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_DELETED)
  handleStageDeleted(payload: { boardId: string; membershipId: string; userName: string; stageId: string; name: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'stage_deleted',
      detail: `Eliminó la etapa "${payload.name}"`,
      meta: { stageId: payload.stageId },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_CREATED)
  handleCardCreated(payload: { boardId: string; membershipId: string; userName: string; cardId: string; title: string; stageId: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_created',
      detail: `Creó la tarjeta "${payload.title}"`,
      meta: { cardId: payload.cardId, stageId: payload.stageId },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_UPDATED)
  handleCardUpdated(payload: { boardId: string; membershipId: string; userName: string; cardId: string; title: string; changes: Record<string, unknown> }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_updated',
      detail: `Actualizó la tarjeta "${payload.title}"`,
      meta: { cardId: payload.cardId, changes: payload.changes } as Prisma.InputJsonValue,
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MOVED)
  handleCardMoved(payload: { boardId: string; membershipId: string; userName: string; cardId: string; title: string; fromStage: string; toStage: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_moved',
      detail: `Movió "${payload.title}" de "${payload.fromStage}" a "${payload.toStage}"`,
      meta: { cardId: payload.cardId, fromStage: payload.fromStage, toStage: payload.toStage },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_DELETED)
  handleCardDeleted(payload: { boardId: string; membershipId: string; userName: string; cardId: string; title: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_deleted',
      detail: `Eliminó la tarjeta "${payload.title}"`,
      meta: { cardId: payload.cardId },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MEMBER_ADDED)
  handleMemberJoinedCard(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; memberName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'member_joined_card',
      detail: `Asignó a "${payload.memberName}" en "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, memberName: payload.memberName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MEMBER_REMOVED)
  handleMemberLeftCard(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; memberName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'member_left_card',
      detail: `Quitó a "${payload.memberName}" de "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, memberName: payload.memberName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_LABEL_ADDED)
  handleLabelAdded(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; labelName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_label_added',
      detail: `Agregó etiqueta "${payload.labelName}" a "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, labelName: payload.labelName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_LABEL_REMOVED)
  handleLabelRemoved(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; labelName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_label_removed',
      detail: `Quitó etiqueta "${payload.labelName}" de "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, labelName: payload.labelName },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_DATE_SET)
  handleDateSet(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; startDate?: string; dueDate?: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_date_set',
      detail: `Estableció fechas en "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, startDate: payload.startDate, dueDate: payload.dueDate },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_CHECKLIST_ADDED)
  handleChecklistAdded(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; itemText: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_checklist_added',
      detail: `Agregó "${payload.itemText}" al checklist de "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, itemText: payload.itemText },
    });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_CHECKLIST_TOGGLED)
  handleChecklistToggled(payload: { boardId: string; membershipId: string; userName: string; cardId: string; cardTitle: string; itemText: string; done: boolean }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'card_checklist_toggled',
      detail: `${payload.done ? 'Completó' : 'Reabrió'} "${payload.itemText}" en "${payload.cardTitle}"`,
      meta: { cardId: payload.cardId, itemText: payload.itemText, done: payload.done },
    });
  }

  @OnEvent(DOMAIN_EVENTS.MEMBER_JOINED)
  handleMemberJoined(payload: { boardId: string; membershipId: string; userName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'member_joined',
      detail: 'entró al tablero',
    });
  }

  @OnEvent(DOMAIN_EVENTS.MEMBER_LEFT)
  handleMemberRemoved(payload: { boardId: string; membershipId: string; userName: string; memberId: string; memberName: string }) {
    return this.activity.log({
      boardId: payload.boardId,
      membershipId: payload.membershipId,
      userName: payload.userName,
      type: 'member_removed',
      detail: `Eliminó a "${payload.memberName}" del tablero`,
      meta: { memberId: payload.memberId, memberName: payload.memberName },
    });
  }
}
