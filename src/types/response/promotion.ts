import { DiscountType } from "../../constant/promotion.constant";

export type PromotionResponse = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  maxUsagePerUser: number | null;
  usageCount: number;
  status: string;
  displayAs?: string;
};

export type PromotionStatsResponse = {
  total: number;
  active: number;
  totalUsage: number;
};

export type FindAllPromotionsResponse = {
  data: PromotionResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
};
