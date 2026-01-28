export const STATUS = {
  ACTIVE: "ACT",
  INACTIVE: "INA",
  DELETED: "DEL",
  PENDING: "PND",
  EXPIRED: "EXP",
  BANNED: "BAN",
  SUSPENDED: "SUS", // Tạm khóa
} as const;

export type StatusCode = (typeof STATUS)[keyof typeof STATUS];
