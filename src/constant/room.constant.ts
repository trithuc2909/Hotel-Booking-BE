export const ROOM_STATUS = {
  AVAILABLE: "AVL",
  CLEANING: "CLN",
  MAINTENANCE: "MNT",
} as const;

export const ROOM_DISPLAY_STATUS = {
  AVAILABLE:   "AVL",
  CLEANING:    "CLN",
  MAINTENANCE: "MNT",
  OCCUPIED:    "OCP",
  RESERVED:    "RSV",
} as const;

export type RoomDisplayStatusCode = 
  (typeof ROOM_DISPLAY_STATUS)[keyof typeof ROOM_DISPLAY_STATUS];

export const ROOM_TYPE_CODE = {
  VIP: "VIP",
  STANDARD: "STD",
} as const;

export type RoomStatusCode = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];
