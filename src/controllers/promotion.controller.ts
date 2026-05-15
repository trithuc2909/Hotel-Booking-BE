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

export const getAdminPromotions = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const filter = matchedData(req, { locations: ["query"] });
    const result = await promotionService.getAdminPromotions(filter);
    res.json(
      ResponseHelper.paginated(
        result.data,
        result.total,
        result.pageNum,
        result.pageSize,
        "Lấy danh sách ưu đãi thành công",
      ),
    );
  },
  "GET_ADMIN_PROMOTIONS_ERROR",
);

export const getAdminPromotionById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await promotionService.getAdminPromotionById(id as string);
    res.json(ResponseHelper.success(result, "Lấy chi tiết ưu đãi thành công"));
  },
  "GET_ADMIN_PROMOTION_BY_ID_ERROR",
);

export const getPromotionStats = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const result = await promotionService.getPromotionStats();
    res.json(ResponseHelper.success(result, "Lấy thống kê ưu đãi thành công"));
  },
  "GET_PROMOTION_STATS_ERROR",
);

export const createPromotion = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const body = matchedData(req, { locations: ["body"] });
    const file = req.file;
    await promotionService.createPromotion(body as any, file);
    res.status(201).json(ResponseHelper.success(null, "Tạo ưu đãi thành công"));
  },
  "CREATE_PROMOTION_ERROR",
);

export const updatePromotion = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = matchedData(req, { locations: ["body"] });
    const file = req.file;
    await promotionService.updatePromotion(id as string, body, file);
    res.json(ResponseHelper.success(null, "Cập nhật ưu đãi thành công"));
  },
  "UPDATE_PROMOTION_ERROR",
);

export const updatePromotionStatus = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    await promotionService.updatePromotionStatus(id as string, status);
    res.json(ResponseHelper.success(null, "Cập nhật trạng thái thành công"));
  },
  "UPDATE_PROMOTION_STATUS_ERROR",
);

export const deletePromotion = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await promotionService.deletePromotion(id as string);
    res.json(ResponseHelper.success(null, "Xóa ưu đãi thành công"));
  },
  "DELETE_PROMOTION_ERROR",
);
