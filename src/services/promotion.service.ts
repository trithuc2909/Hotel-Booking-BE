import { STATUS } from "../constant/status.constant";
import * as promotionDb from "../db/promotion.db";
import AppError from "../utils/appError";
import { DiscountType } from "@prisma/client";

export const getAllPromotions = async () => {
  return promotionDb.findAllPromotions();
};

export const validatePromotionCode = async (
  code: string,
  orderValue: number,
  userId: string,
) => {
  const promo = await promotionDb.findPromotionByCode(code, userId);
  const now = new Date();

  if (!promo || promo.status !== STATUS.ACTIVE) {
    throw AppError.badRequest(
      "Mã giảm giá không tồn tại hoặc đã hết hạn",
      "INVALID_PROMO",
    );
  }

  if (promo.startDate && now < promo.startDate) {
    throw AppError.badRequest(
      "Mã giảm giá chưa có hiệu lực",
      "PROMO_NOT_STARTED",
    );
  }

  if (promo.endDate && now > promo.endDate) {
    throw AppError.badRequest(
      "Mã giảm giá đã hết hạn sử dụng",
      "PROMO_EXPIRED",
    );
  }

  if (promo.minOrderValue && orderValue < Number(promo.minOrderValue)) {
    throw AppError.badRequest(
      `Đơn hàng tối thiểu ${promo.minOrderValue.toString()} để dùng mã này`,
      "PROMO_MIN_ORDER",
    );
  }

  if (promo.usageLimit && promo._count.usages >= promo.usageLimit)
    throw AppError.badRequest(
      "Mã giảm giá đã hết lượt dùng",
      "PROMO_LIMIT_REACHED",
    );

  if (promo.maxUsagePerUser && promo.usages.length >= promo.maxUsagePerUser)
    throw AppError.badRequest(
      "Bạn đã dùng mã này tối đa số lần cho phép",
      "PROMO_USER_LIMIT_REACHED",
    );

  let discountAmount = 0;

  if (promo.discountType === DiscountType.PERCENT) {
    discountAmount = (orderValue * Number(promo.discountValue)) / 100;

    if (promo.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(promo.maxDiscount));
    }
  } else {
    discountAmount = Math.min(Number(promo.discountValue), orderValue);
  }

  discountAmount = Math.round(discountAmount);

  return {
    promotionId: promo.id,
    title: promo.title,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue),
    discountAmount,
    originalAmount: orderValue,
    finalAmount: Math.max(orderValue - discountAmount, 0),
  };
};
