import { Prisma } from "@prisma/client";
import { STATUS, STATUS_TYPE } from "../constant/status.constant";
import {
  CreatePromotionRequest,
  PromotionFilter,
  UpdatePromotionRequest,
} from "../types/request/promotion";
import {
  FindAllPromotionsResponse,
  PromotionResponse,
  PromotionStatsResponse,
} from "../types/response/promotion";
import prisma from "./prisma";
import { ROLE_CONSTANTS } from "../constant/common.constant";

export const findAllPromotions = async () => {
  const now = new Date();

  return prisma.promotion.findMany({
    where: {
      status: STATUS.ACTIVE,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { createdOn: "desc" },
  });
};

export const findPromotionByCode = async (code: string, userId: string) => {
  return prisma.promotion.findUnique({
    where: { code },
    include: {
      _count: {
        select: { usages: true },
      },
      usages: {
        where: { userId },
        select: { id: true },
      },
    },
  });
};

export const findAdminPromotionByCode = (code: string) =>
  prisma.promotion.findUnique({ where: { code } });

export const findAdminPromotions = async (
  filter: PromotionFilter,
): Promise<FindAllPromotionsResponse> => {
  const { search, status, discountType, pageNum = 1, pageSize = 10 } = filter;
  const offset = (pageNum - 1) * pageSize;
  const conditions: Prisma.Sql[] = [];
  if (search)
    conditions.push(
      Prisma.sql`(p.code ILIKE ${"%" + search + "%"} OR p.title ILIKE ${"%" + search + "%"})`,
    );
  if (status) conditions.push(Prisma.sql`p.status = ${status}`);
  if (discountType)
    conditions.push(Prisma.sql`p."discountType"::text = ${discountType}`);
  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;
  const [rows, countResult] = await Promise.all([
    prisma.$queryRaw<PromotionResponse[]>`
      SELECT
        p.id, p.code, p.title, p.description, p."imageUrl",
        p."discountType"::text AS "discountType",
        p."discountValue", p."minOrderValue", p."maxDiscount",
        p."startDate", p."endDate", p."usageLimit", p."maxUsagePerUser",
        p.status,
        c."displayAs",
        COUNT(pu.id)::int AS "usageCount"
      FROM promotions p
      LEFT JOIN codes c ON c.code = p.status AND c.type = ${STATUS_TYPE.SERVICE_STATUS}
      LEFT JOIN promotion_usages pu ON pu."promotionId" = p.id
      ${whereClause}
      GROUP BY p.id, c."displayAs"
      ORDER BY p."createdOn" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
    prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*)::bigint AS total FROM promotions p ${whereClause}
    `,
  ]);
  const total = Number(countResult[0]?.total ?? 0);
  return {
    data: rows,
    total,
    pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const findAdminPromotionById = async (id: string) => {
  const result = await prisma.$queryRaw<PromotionResponse[]>`
    SELECT
      p.id, p.code, p.title, p.description, p."imageUrl",
      p."discountType"::text AS "discountType",
      p."discountValue", p."minOrderValue", p."maxDiscount",
      p."startDate", p."endDate", p."usageLimit", p."maxUsagePerUser",
      p.status, c."displayAs",
      COUNT(pu.id)::int AS "usageCount"
    FROM promotions p
    LEFT JOIN codes c ON c.code = p.status AND c.type = ${STATUS_TYPE.SERVICE_STATUS}
    LEFT JOIN promotion_usages pu ON pu."promotionId" = p.id
    WHERE p.id = ${id}
    GROUP BY p.id, c."displayAs"
  `;
  return result[0] ?? null;
};

export const createPromotion = (data: CreatePromotionRequest) =>
  prisma.promotion.create({
    data: { ...data, createdBy: ROLE_CONSTANTS.ADMIN },
  });

export const updatePromotion = (id: string, data: UpdatePromotionRequest) =>
  prisma.promotion.update({
    where: { id },
    data: { ...data, modifiedOn: new Date(), modifiedBy: ROLE_CONSTANTS.ADMIN },
  });

export const updatePromotionStatus = (id: string, status: string) =>
  prisma.promotion.update({
    where: { id },
    data: { status, modifiedOn: new Date(), modifiedBy: ROLE_CONSTANTS.ADMIN },
  });

export const deletePromotionById = (id: string) =>
  prisma.promotion.delete({ where: { id } });

export const getPromotionStats = async (): Promise<PromotionStatsResponse> => {
  const [total, active, totalUsage] = await Promise.all([
    prisma.promotion.count(),

    prisma.promotion.count({
      where: {
        status: STATUS.ACTIVE,
      },
    }),

    prisma.promotionUsage.count(),
  ]);

  return {
    total,
    active,
    totalUsage,
  };
};
