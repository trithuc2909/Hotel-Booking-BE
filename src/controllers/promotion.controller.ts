import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { Request, Response } from "express";
import * as promotionService from "../services/promotion.service";
import { ResponseHelper } from "../utils/response";

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
