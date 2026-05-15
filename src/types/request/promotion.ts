import { DiscountType } from "../../constant/promotion.constant";

export type PromotionFilter = {
  search?: string;
  status?: string;
  discountType?: DiscountType;
  pageNum?: number;
  pageSize?: number;
};

export type CreatePromotionRequest = {
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  maxUsagePerUser?: number;
  imageUrl?: string;
};

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;
