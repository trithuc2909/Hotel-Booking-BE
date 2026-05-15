export const DISCOUNT_TYPE = {
  FIXED: "FIXED",
  PERCENT: "PERCENT",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];