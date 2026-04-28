import { Injectable, Logger } from "@nestjs/common";
import type { Server } from "socket.io";
import {
  boardRoom,
  REALTIME_EVENTS,
  type RealtimeEvent,
} from "./events.constants";

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  bindServer(server: Server): void {
    this.server = server;
    this.logger.log("RealtimeService bound to server");
  }

  emitToBoard<T>(boardId: string, event: RealtimeEvent, payload: T): void {
    if (!this.server) {
      this.logger.debug(
        `Server not ready; dropped '${event}' for board:${boardId}`,
      );
      return;
    }
    this.server.to(boardRoom(boardId)).emit(event, payload);
  }

  boardUpdated<T>(boardId: string, payload: T): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.BOARD_UPDATED, payload);
  }

  boardDeleted(boardId: string): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.BOARD_DELETED, { boardId });
  }

  stageChanged<T>(boardId: string, event: RealtimeEvent, payload: T): void {
    this.emitToBoard(boardId, event, payload);
  }

  cardChanged<T>(boardId: string, event: RealtimeEvent, payload: T): void {
    this.emitToBoard(boardId, event, payload);
  }

  attachmentChanged<T>(boardId: string, payload: T): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.ATTACHMENT_CHANGED, payload);
  }

  checklistChanged<T>(boardId: string, payload: T): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.CHECKLIST_CHANGED, payload);
  }

  commentCreated<T>(boardId: string, payload: T): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.COMMENT_CREATED, payload);
  }

  activityNew<T>(boardId: string, payload: T): void {
    this.emitToBoard(boardId, REALTIME_EVENTS.ACTIVITY_NEW, payload);
  }

  memberChanged<T>(boardId: string, event: RealtimeEvent, payload: T): void {
    this.emitToBoard(boardId, event, payload);
  }

  get isBound(): boolean {
    return this.server !== null;
  }
}
