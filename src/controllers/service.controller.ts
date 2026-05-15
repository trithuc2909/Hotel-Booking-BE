import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as serviceService from "../services/service.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";

export const getAllServices = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const services = await serviceService.getAllServices();
    res.json(
      ResponseHelper.success(services, "Lấy danh sách dịch vụ thành công"),
    );
  },
  "GET_SERVICES_ERROR",
);

export const getAllServiceCategories = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const categories = await serviceService.getAllServiceCategories();
    res.json(
      ResponseHelper.success(
        categories,
        "Lấy danh sách danh mục dịch vụ thành công",
      ),
    );
  },
  "GET_SERVICE_CATEGORIES_ERROR",
);

export const getAdminServices = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const filter = matchedData(req, { locations: ["query"] });
    const result = await serviceService.getAdminServices(filter);
    res.json(
      ResponseHelper.paginated(
        result.data,
        result.total,
        result.pageNum,
        result.pageSize,
        "Lấy danh sách dịch vụ thành công",
      ),
    );
  },
  "GET_ADMIN_SERVICES_ERROR",
);

export const getServiceStats = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const result = await serviceService.getServiceStats();
    res.json(ResponseHelper.success(result, "Lấy thống kê dịch vụ thành công"));
  },
  "GET_SERVICE_STATS_ERROR",
);

export const createService = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const body = matchedData(req, { locations: ["body"] });
    const file = req.file;
    await serviceService.createService(body as any, file);
    res
      .status(201)
      .json(ResponseHelper.success(null, "Tạo dịch vụ thành công"));
  },
  "CREATE_SERVICE_ERROR",
);

export const updateService = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = matchedData(req, { locations: ["body"] });
    const file = req.file;
    await serviceService.updateService(id as string, body, file);
    res.json(ResponseHelper.success(null, "Cập nhật dịch vụ thành công"));
  },
  "UPDATE_SERVICE_ERROR",
);

export const updateServiceStatus = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    await serviceService.updateServiceStatus(id as string, status);
    res.json(ResponseHelper.success(null, "Cập nhật trạng thái thành công"));
  },
  "UPDATE_SERVICE_STATUS_ERROR",
);

export const deleteService = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await serviceService.deleteService(id as string);
    res.json(ResponseHelper.success(null, "Xóa dịch vụ thành công"));
  },
  "DELETE_SERVICE_ERROR",
);

export const getAdminServiceById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await serviceService.getAdminServiceById(id as string);
    res.json(ResponseHelper.success(result, "Lấy chi tiết dịch vụ thành công"));
  },
  "GET_ADMIN_SERVICE_BY_ID_ERROR",
);
