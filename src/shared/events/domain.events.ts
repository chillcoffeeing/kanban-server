export const DOMAIN_EVENTS = {
  BOARD_UPDATED: 'board.updated',

  STAGE_CREATED: 'stage.created',
  STAGE_UPDATED: 'stage.updated',
  STAGE_DELETED: 'stage.deleted',
  STAGE_REORDERED: 'stage.reordered',

  CARD_CREATED: 'card.created',
  CARD_UPDATED: 'card.updated',
  CARD_MOVED: 'card.moved',
  CARD_DELETED: 'card.deleted',
  CARD_MEMBER_ADDED: 'card.member_added',
  CARD_MEMBER_REMOVED: 'card.member_removed',
  CARD_LABEL_ADDED: 'card.label_added',
  CARD_LABEL_REMOVED: 'card.label_removed',
  CARD_DATE_SET: 'card.date_set',
  CARD_CHECKLIST_ADDED: 'card.checklist_added',
  CARD_CHECKLIST_TOGGLED: 'card.checklist_toggled',

  CHECKLIST_CHANGED: 'checklist.changed',
  COMMENT_CREATED: 'comment.created',

  MEMBER_JOINED: 'member.joined',
  MEMBER_LEFT: 'member.left',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
} as const;

export type DomainEvent = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];
