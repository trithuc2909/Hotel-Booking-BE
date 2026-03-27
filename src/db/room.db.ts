import { Prisma } from "@prisma/client";
import { STATUS } from "../constant/status.constant";
import { FindAllRoomsResponse, RoomResponse, RoomsFilter } from "../types/response/room";
import prisma from "./prisma";

const SORT_COLUMNS_MAP: Record<string, Prisma.Sql> = {
  basePrice: Prisma.sql`r."basePrice"`,
  rating:    Prisma.sql`r."rating"`,
  roomName:  Prisma.sql`r."roomName"`,
  createdOn: Prisma.sql`r."createdOn"`,
};

const buildWhereClause = (filter: RoomsFilter): Prisma.Sql => {
  const conditions: Prisma.Sql[] = [];

  if (filter.roomTypeCode) {
    conditions.push(Prisma.sql`rt.code = ${filter.roomTypeCode}`);
  }

  if (filter.guests !== undefined) {
    conditions.push(Prisma.sql`r."maxGuests" >= ${filter.guests}`);
  }

  if (filter.minPrice !== undefined) {
    conditions.push(Prisma.sql`r."basePrice" >= ${filter.minPrice}`);
  }

  if (filter.maxPrice !== undefined) {
    conditions.push(Prisma.sql`r."basePrice" <= ${filter.maxPrice}`);
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
};

export const findAllRooms = async (
  filter: RoomsFilter,
): Promise<FindAllRoomsResponse> => {
  const { pageNum, pageSize, sortBy, sortDirection } = filter;
  const offset = (pageNum! - 1) * pageSize!;

  const whereClause       = buildWhereClause(filter);
  const safeSortBy        = SORT_COLUMNS_MAP[sortBy!] ?? Prisma.sql`r."createdOn"`;
  const safeSortDirection = sortDirection === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  const dataQuery = prisma.$queryRaw<RoomResponse[]>`
    SELECT
      r.id,
      rt.id         AS "roomTypeId",
      rt.name       AS "roomTypeName",
      rt.code       AS "roomTypeCode",
      r."roomNumber",
      r."roomName",
      r.notes,
      r."basePrice",
      r."maxGuests",
      r."thumbnailUrl",
      r.status,
      r."rating",
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', a.id, 'name', a.name, 'icon', a.icon)
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS "amenities"
    FROM rooms r
    INNER JOIN room_types rt ON r."roomTypeId" = rt.id
    LEFT JOIN room_amenities ra ON ra."roomId" = r.id
    LEFT JOIN amenities a
      ON a.id = ra."amenityId"
      AND a.status = ${STATUS.ACTIVE}
    ${whereClause}
    GROUP BY r.id, rt.id, rt.name, rt.code
    ORDER BY ${safeSortBy} ${safeSortDirection}
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const countQuery = prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT r.id) AS count
    FROM rooms r
    INNER JOIN room_types rt ON r."roomTypeId" = rt.id
    LEFT JOIN room_amenities ra ON ra."roomId" = r.id
    LEFT JOIN amenities a
      ON a.id = ra."amenityId"
      AND a.status = ${STATUS.ACTIVE}
    ${whereClause}
  `;

  const [data, countResult] = await Promise.all([dataQuery, countQuery]);
  const total = Number(countResult[0]?.count ?? 0);

  return { data, total, pageNum: pageNum!, pageSize: pageSize! };
};