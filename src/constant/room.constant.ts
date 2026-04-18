export const ROOM_STATUS = {
  AVAILABLE: "AVL",
  OCCUPIED: "OCP",
  CLEANING: "CLN",
  RESERVED: "RSV",
} as const;

export const ROOM_TYPE_CODE = {
  VIP: "VIP",
  STANDARD: "STD",
} as const;

export type RoomStatusCode = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];
