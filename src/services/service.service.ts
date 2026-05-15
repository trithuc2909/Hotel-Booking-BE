import { STATUS } from "../constant/status.constant";

import * as serviceDb from "../db/service.db";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../types/request/service";
import { ServicesFilter } from "../types/response/service";
import AppError from "../utils/appError";
import { minioService } from "./minio.service";

export const getAllServices = async () => {
  return serviceDb.findAllServices();
};

export const getAllServiceCategories = async () => {
  return serviceDb.findAllServiceCategories();
};

export const getAdminServices = async (filter: ServicesFilter) => {
  const pageNum = Math.max(1, filter.pageNum ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 10));
  return serviceDb.findAdminServices({ ...filter, pageNum, pageSize });
};

export const createService = async (
  data: CreateServiceRequest,
  file?: Express.Multer.File,
) => {
  const existing = await serviceDb.findServiceByName(data.name);
  if (existing)
    throw AppError.conflict("Tên dịch vụ đã tồn tại", "SERVICE_NAME_EXISTED");

  const service = await serviceDb.createService(data);

  if (file) {
    const result = await minioService.uploadServiceImage(service.id, file);
    await serviceDb.updateService(service.id, { imageUrl: result.url });
  }

  return service;
};

export const getServiceStats = async () => {
  return serviceDb.getServiceStats();
};

export const updateService = async (
  id: string,
  data: UpdateServiceRequest,
  file?: Express.Multer.File,
) => {
  const service = await serviceDb.findServiceById(id);
  if (!service)
    throw AppError.notFound("Không tìm thấy dịch vụ", "SERVICE_NOT_FOUND");

  if (data.name && data.name !== service.name) {
    const existing = await serviceDb.findServiceByName(data.name);

    if (existing)
      throw AppError.conflict("Tên dịch vụ đã tồn tại", "SERVICE_NAME_EXISTED");
  }
  let imageUrl = service.imageUrl ?? undefined;
  if (file) {
    const result = await minioService.uploadServiceImage(id, file);
    imageUrl = result.url;
  }
  return serviceDb.updateService(id, { ...data, imageUrl });
};

export const deleteService = async (id: string) => {
  const service = await serviceDb.findServiceById(id);
  if (!service)
    throw AppError.notFound("Không tìm thấy dịch vụ", "SERVICE_NOT_FOUND");

  if (service.status !== STATUS.INACTIVE)
    throw AppError.badRequest(
      "Không thể xóa dịch vụ khi đang hoạt động",
      "CANNOT_DELETE_ACTIVE_SERVICE",
    );

  await minioService.deleteServiceFolder(id).catch(() => {});

  return serviceDb.deleteServiceById(id);
};

export const updateServiceStatus = async (id: string, status: string) => {
  const service = await serviceDb.findServiceById(id);
  if (!service)
    throw AppError.notFound("Không tìm thấy dịch vụ", "SERVICE_NOT_FOUND");
  const validStatuses = [STATUS.ACTIVE, STATUS.INACTIVE];
  if (!validStatuses.includes(status as any))
    throw AppError.badRequest("Trạng thái không hợp lệ", "INVALID_STATUS");
  return serviceDb.updateServiceStatus(id, status);
};

export const getAdminServiceById = async (id: string) => {
  const service = await serviceDb.findAdminServiceById(id);
  if (!service)
    throw AppError.notFound("Không tìm thấy dịch vụ", "SERVICE_NOT_FOUND");
  return service;
};
