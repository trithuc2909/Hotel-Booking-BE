import { Prisma } from "@prisma/client";
import { STATUS, STATUS_TYPE } from "../constant/status.constant";
import {
  FindAllServicesResponse,
  ServiceResponse,
  ServicesFilter,
  ServiceStatsResponse,
} from "../types/response/service";
import prisma from "./prisma";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../types/request/service";
import { ROLE_CONSTANTS } from "../constant/common.constant";

export const findAllServices = async () => {
  return prisma.service.findMany({
    where: { status: STATUS.ACTIVE },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
};

export const findAllServiceCategories = async () => {
  return prisma.serviceCategory.findMany({
    where: { status: STATUS.ACTIVE },
    orderBy: { name: "asc" },
  });
};

// Admin service

const buildServiceWhereClause = (filter: ServicesFilter): Prisma.Sql => {
  const conditions: Prisma.Sql[] = [];
  if (filter.search?.trim()) {
    const keyword = `%${filter.search.trim().replace(/[%_]/g, "\\$&")}%`;
    conditions.push(Prisma.sql`s.name ILIKE ${keyword}`);
  }
  if (filter.categoryId) {
    conditions.push(Prisma.sql`s."serviceCategoryId" = ${filter.categoryId}`);
  }
  if (filter.status) {
    conditions.push(Prisma.sql`s.status = ${filter.status}`);
  }
  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
};

export const findAdminServices = async (
  filter: ServicesFilter,
): Promise<FindAllServicesResponse> => {
  const { pageNum = 1, pageSize = 10 } = filter;
  const offset = (pageNum - 1) * pageSize;
  const whereClause = buildServiceWhereClause(filter);
  const dataQuery = prisma.$queryRaw<ServiceResponse[]>`
    SELECT
      s.id,
      s.name,
      s.description,
      s."imageUrl",
      s."basePrice",
      s.unit,
      s.status,
      c."displayAs",
      JSON_BUILD_OBJECT(
        'id',   sc.id,
        'name', sc.name,
        'icon', sc.icon
      ) AS category
    FROM services s
    INNER JOIN service_categories sc ON sc.id = s."serviceCategoryId"
    LEFT JOIN codes c ON c.code = s.status AND c.type = ${STATUS_TYPE.SERVICE_STATUS}
    ${whereClause}
    ORDER BY sc.name ASC, s.name ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  const countQuery = prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM services s
    INNER JOIN service_categories sc ON sc.id = s."serviceCategoryId"
    ${whereClause}
  `;
  const [data, countResult] = await Promise.all([dataQuery, countQuery]);
  const total = Number(countResult[0]?.count ?? 0);
  return { data, total, pageNum, pageSize };
};

export const getServiceStats = async (): Promise<ServiceStatsResponse> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  const [total, active, revenueResult] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { status: STATUS.ACTIVE } }),
    prisma.bookingService.aggregate({
      _sum: { totalPrice: true },
      where: {
        createdOn: { gte: startOfMonth, lte: endOfMonth },
        status: STATUS.ACTIVE,
      },
    }),
  ]);
  return {
    total,
    active,
    inactive: total - active,
    revenue: Number(revenueResult._sum.totalPrice ?? 0),
  };
};

export const findServiceById = async (id: string) => {
  return prisma.service.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, icon: true } },
    },
  });
};

export const createService = async (data: CreateServiceRequest) => {
  return prisma.service.create({
    data: {
      name: data.name,
      serviceCategoryId: data.serviceCategoryId,
      description: data.description,
      imageUrl: data.imageUrl,
      basePrice: data.basePrice,
      unit: data.unit,
      status: STATUS.ACTIVE,
      createdBy: ROLE_CONSTANTS.ADMIN,
    },
  });
};

export const updateService = async (id: string, data: UpdateServiceRequest) => {
  return prisma.service.update({
    where: { id },
    data: { ...data, modifiedOn: new Date(), modifiedBy: ROLE_CONSTANTS.ADMIN },
  });
};

export const deleteServiceById = async (id: string) => {
  return prisma.service.delete({ where: { id } });
};

export const findServiceByName = async (name: string) => {
  return prisma.service.findFirst({ where: { name } });
};

export const updateServiceStatus = async (id: string, status: string) => {
  return prisma.service.update({
    where: { id },
    data: { status, modifiedOn: new Date(), modifiedBy: ROLE_CONSTANTS.ADMIN },
  });
};

export const findAdminServiceById = async (id: string) => {
  const result = await prisma.$queryRaw<ServiceResponse[]>`
    SELECT
      s.id,
      s.name,
      s.description,
      s."imageUrl",
      s."basePrice",
      s.unit,
      s.status,
      c."displayAs",
      JSON_BUILD_OBJECT(
        'id',   sc.id,
        'name', sc.name,
        'icon', sc.icon
      ) AS category
    FROM services s
    INNER JOIN service_categories sc ON sc.id = s."serviceCategoryId"
    LEFT JOIN codes c ON c.code = s.status AND c.type = ${STATUS_TYPE.SERVICE_STATUS}
    WHERE s.id = ${id}
  `;
  return result[0] ?? null;
};
