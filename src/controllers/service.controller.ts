import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as serviceService from "../services/service.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";

export const getAllServices = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const services = await serviceService.getAllServices();
    res.json(ResponseHelper.success(services, "Lấy danh sách dịch vụ thành công"));
  },
  "GET_SERVICES_ERROR",
);

export const getAllServiceCategories = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const categories = await serviceService.getAllServiceCategories();
    res.json(ResponseHelper.success(categories, "Lấy danh sách danh mục dịch vụ thành công"));
  },
  "GET_SERVICE_CATEGORIES_ERROR",
);
