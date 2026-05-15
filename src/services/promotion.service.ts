import { STATUS } from "../constant/status.constant";
import * as promotionDb from "../db/promotion.db";
import {
  CreatePromotionRequest,
  PromotionFilter,
  UpdatePromotionRequest,
} from "../types/request/promotion";
import AppError from "../utils/appError";
import { DiscountType } from "@prisma/client";
import { minioService } from "./minio.service";

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

export const getAdminPromotions = async (filter: PromotionFilter) => {
  const pageNum = Math.max(1, filter.pageNum ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 10));
  return promotionDb.findAdminPromotions({ ...filter, pageNum, pageSize });
};

export const getAdminPromotionById = async (id: string) => {
  const p = await promotionDb.findAdminPromotionById(id);
  if (!p)
    throw AppError.notFound("Không tìm thấy ưu đãi", "PROMOTION_NOT_FOUND");
  return p;
};

export const createPromotion = async (
  data: CreatePromotionRequest,
  file?: Express.Multer.File,
) => {
  const existing = await promotionDb.findAdminPromotionByCode(data.code);
  if (existing)
    throw AppError.conflict("Mã ưu đãi đã tồn tại", "PROMOTION_CODE_EXISTED");
  const promotion = await promotionDb.createPromotion(data);
  if (file) {
    const result = await minioService.uploadPromotionImage(promotion.id, file);
    await promotionDb.updatePromotion(promotion.id, { imageUrl: result.url });
  }
  return promotion;
};

export const updatePromotion = async (
  id: string,
  data: UpdatePromotionRequest,
  file?: Express.Multer.File,
) => {
  const promotion = await promotionDb.findAdminPromotionById(id);
  if (!promotion)
    throw AppError.notFound("Không tìm thấy ưu đãi", "PROMOTION_NOT_FOUND");
  if (data.code && data.code !== promotion.code) {
    const existing = await promotionDb.findAdminPromotionByCode(data.code);
    if (existing)
      throw AppError.conflict("Mã ưu đãi đã tồn tại", "PROMOTION_CODE_EXISTED");
  }
  let imageUrl = promotion.imageUrl ?? undefined;
  if (file) {
    const result = await minioService.uploadPromotionImage(id, file);
    imageUrl = result.url;
  }
  return promotionDb.updatePromotion(id, { ...data, imageUrl });
};

export const updatePromotionStatus = async (id: string, status: string) => {
  const promotion = await promotionDb.findAdminPromotionById(id);
  if (!promotion)
    throw AppError.notFound("Không tìm thấy ưu đãi", "PROMOTION_NOT_FOUND");
  const valid = [STATUS.ACTIVE, STATUS.INACTIVE];
  if (!valid.includes(status as any))
    throw AppError.badRequest("Trạng thái không hợp lệ", "INVALID_STATUS");
  return promotionDb.updatePromotionStatus(id, status);
};

export const deletePromotion = async (id: string) => {
  const promotion = await promotionDb.findAdminPromotionById(id);
  if (!promotion)
    throw AppError.notFound("Không tìm thấy ưu đãi", "PROMOTION_NOT_FOUND");
  if (promotion.status !== STATUS.INACTIVE)
    throw AppError.badRequest(
      "Phải ngưng ưu đãi trước khi xóa",
      "CANNOT_DELETE_ACTIVE_PROMOTION",
    );
  await minioService.deletePromotionFolder(id).catch(() => {});
  return promotionDb.deletePromotionById(id);
};

export const getPromotionStats = () => promotionDb.getPromotionStats();
