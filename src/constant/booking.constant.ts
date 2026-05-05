export const BOOKING_STATUS = {
  PENDING: "PND",
  PENDING_PAYMENT: "PPY",
  CONFIRMED: "CFM",
  CHECKED_IN: "CHK",
  CHECKED_OUT: "CKO",
  CANCELLED: "CAN",
  NO_SHOW: "NSW",
  EXPIRED: "EXP",
} as const;

export type BookingStatusCode =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
