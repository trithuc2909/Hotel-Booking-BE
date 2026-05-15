export const STATUS = {
  ACTIVE: "ACT",
  INACTIVE: "INA",
  DELETED: "DEL",
  PENDING: "PND",
  EXPIRED: "EXP",
  BANNED: "BAN",
  SUSPENDED: "SUS",
} as const;


export const STATUS_TYPE = {
  ROOM_STATUS: "ROOM_STATUS",
  BOOKING_STATUS: "BOOKING_STATUS",
  SERVICE_STATUS: "SERVICE_STATUS",
} as const;

export type StatusCode = (typeof STATUS)[keyof typeof STATUS];
export type StatusType = (typeof STATUS_TYPE)[keyof typeof STATUS_TYPE];
