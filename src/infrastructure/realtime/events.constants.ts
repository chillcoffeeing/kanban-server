export const REALTIME_EVENTS = {
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',

  STAGE_CREATED: 'stage:created',
  STAGE_UPDATED: 'stage:updated',
  STAGE_DELETED: 'stage:deleted',
  STAGE_REORDERED: 'stage:reordered',

  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_MOVED: 'card:moved',
  CARD_DELETED: 'card:deleted',
  CARD_MEMBER_ADDED: 'card:member_added',
  CARD_MEMBER_REMOVED: 'card:member_removed',

  CHECKLIST_CHANGED: 'checklist:changed',
  ATTACHMENT_CHANGED: 'attachment:changed',
  COMMENT_CREATED: 'comment:created',

  ACTIVITY_NEW: 'activity:new',

  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
  MEMBER_ROLE_CHANGED: 'member:role_changed',
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export const boardRoom = (boardId: string): string => `board:${boardId}`;
