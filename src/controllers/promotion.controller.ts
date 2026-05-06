import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { Request, Response } from "express";
import * as promotionService from "../services/promotion.service";
import { ResponseHelper } from "../utils/response";
import { matchedData } from "express-validator";
import { AuthenticatedUser } from "../types/request/base";

export const getAllPromotions = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const promotions = await promotionService.getAllPromotions();
    res.json(
      ResponseHelper.success(
        promotions,
        "Lấy danh sách mã giảm giá thành công",
      ),
    );
  },
  "GET_PROMOTIONS_ERROR",
);

export const validatePromoCode = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const code = String(req.query.code ?? "").trim();
    const orderValue = Number(req.query.orderValue ?? 0);

    const result = await promotionService.validatePromotionCode(
      code,
      orderValue,
      user.id,
    );
    res.json(ResponseHelper.success(result, "Áp dụng mã giảm giá thành công"));
  },
  "VALIDATE_PROMO_ERROR",
);
