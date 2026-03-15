export const ROOM_STATUS = {
  AVAILABLE: "AVL",
  OCCUPIED: "OCP", // Đang có khách
  CLEANING: "CLN",
  MAINTENANCE: "MNT",
  RESERVED: "RSV",
} as const;

export const ROOM_TYPE_CODE = {
  VIP: "VIP",
  STANDARD: "STD",
} as const;

export type RoomStatusCode = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];
