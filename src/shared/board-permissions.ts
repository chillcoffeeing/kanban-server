export const BOARD_PERMISSIONS = [
  'create_stage',
  'create_card',
  'modify_card',
  'delete_card',
  'invite_member',
  'modify_board',
] as const;

export type BoardPermission = (typeof BOARD_PERMISSIONS)[number];

export const DEFAULT_MEMBER_PERMISSIONS: BoardPermission[] = [...BOARD_PERMISSIONS];
