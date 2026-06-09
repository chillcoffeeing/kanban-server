import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RealtimeService } from './realtime.service';
import { DOMAIN_EVENTS } from '@shared/events/domain.events';
import { REALTIME_EVENTS } from './events.constants';

@Injectable()
export class RealtimeListener {
  constructor(
    private readonly realtime: RealtimeService,
  ) {}

  @OnEvent(DOMAIN_EVENTS.BOARD_UPDATED)
  handleBoardUpdated(payload: { boardId: string; data: unknown }) {
    this.realtime.boardUpdated(payload.boardId, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_CREATED)
  handleStageCreated(payload: { boardId: string; data: unknown }) {
    this.realtime.stageChanged(payload.boardId, REALTIME_EVENTS.STAGE_CREATED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_UPDATED)
  handleStageUpdated(payload: { boardId: string; data: unknown }) {
    this.realtime.stageChanged(payload.boardId, REALTIME_EVENTS.STAGE_UPDATED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_DELETED)
  handleStageDeleted(payload: { boardId: string; stageId: string }) {
    this.realtime.stageChanged(payload.boardId, REALTIME_EVENTS.STAGE_DELETED, { id: payload.stageId, boardId: payload.boardId });
  }

  @OnEvent(DOMAIN_EVENTS.STAGE_REORDERED)
  handleStageReordered(payload: { boardId: string; data: unknown }) {
    this.realtime.stageChanged(payload.boardId, REALTIME_EVENTS.STAGE_REORDERED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CARD_CREATED)
  handleCardCreated(payload: { boardId: string; data: unknown }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_CREATED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CARD_UPDATED)
  handleCardUpdated(payload: { boardId: string; data: unknown }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_UPDATED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MOVED)
  handleCardMoved(payload: { boardId: string; data: unknown }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_MOVED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CARD_DELETED)
  handleCardDeleted(payload: { boardId: string; cardId: string }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_DELETED, { id: payload.cardId, boardId: payload.boardId });
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MEMBER_ADDED)
  handleCardMemberAdded(payload: { boardId: string; data: unknown }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_MEMBER_ADDED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CARD_MEMBER_REMOVED)
  handleCardMemberRemoved(payload: { boardId: string; data: unknown }) {
    this.realtime.cardChanged(payload.boardId, REALTIME_EVENTS.CARD_MEMBER_REMOVED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.CHECKLIST_CHANGED)
  handleChecklistChanged(payload: { boardId: string; data: unknown }) {
    this.realtime.checklistChanged(payload.boardId, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.COMMENT_CREATED)
  handleCommentCreated(payload: { boardId: string; data: unknown }) {
    this.realtime.commentCreated(payload.boardId, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.MEMBER_JOINED)
  handleMemberJoined(payload: { boardId: string; data: unknown }) {
    this.realtime.memberChanged(payload.boardId, REALTIME_EVENTS.MEMBER_JOINED, payload.data);
  }

  @OnEvent(DOMAIN_EVENTS.MEMBER_LEFT)
  handleMemberLeft(payload: { boardId: string; membershipId: string }) {
    this.realtime.memberChanged(payload.boardId, REALTIME_EVENTS.MEMBER_LEFT, { boardId: payload.boardId, membershipId: payload.membershipId });
  }

  @OnEvent(DOMAIN_EVENTS.MEMBER_ROLE_CHANGED)
  handleMemberRoleChanged(payload: { boardId: string; data: unknown }) {
    this.realtime.memberChanged(payload.boardId, REALTIME_EVENTS.MEMBER_ROLE_CHANGED, payload.data);
  }
}
