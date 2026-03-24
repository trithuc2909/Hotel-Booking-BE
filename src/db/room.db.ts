import { Prisma } from "@prisma/client";
import { STATUS } from "../constant/status.constant";
import { RoomResponse, RoomsFilter } from "../types/response/room";
import prisma from "./prisma";

const SORT_COLUMNS_MAP: Record<string, Prisma.Sql> = {
  basePrice: Prisma.sql`r."basePrice"`,
  rating: Prisma.sql`r."rating"`,
  roomName: Prisma.sql`r."roomName"`,
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

  // TODO: Bật lại khi có bảng bookings
  // if (filter.checkIn && filter.checkOut) {
  //   conditions.push(Prisma.sql`
  //     NOT EXISTS (
  //       SELECT 1
  //       FROM bookings b
  //       WHERE b."roomId" = r.id
  //         AND b."checkIn" < ${filter.checkOut}
  //         AND b."checkOut" > ${filter.checkIn}
  //     )
  //   `);
  // }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
};

const buildLimitClause = (limit?: number): Prisma.Sql => {
  if (limit === undefined) return Prisma.empty;
  return Prisma.sql`LIMIT ${limit}`;
};

export const findAllRooms = async (
  filter: RoomsFilter = {},
  sortBy: string = "createdOn",
  sortDirection: "asc" | "desc" = "asc",
): Promise<RoomResponse[]> => {
  const whereClause = buildWhereClause(filter);
  const limitClause = buildLimitClause(filter.limit);

  const safeSortBy = SORT_COLUMNS_MAP[sortBy] ?? Prisma.sql`r."createdOn"`;

  const safeSortDirection =
    sortDirection === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  return prisma.$queryRaw<RoomResponse[]>`
    SELECT
      r.id,
      rt.id                         AS "roomTypeId",
      rt.name                       AS "roomTypeName",
      rt.code                       AS "roomTypeCode",
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
          JSON_BUILD_OBJECT(
            'id',   a.id,
            'name', a.name,
            'icon', a.icon
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS "amenities"
    FROM rooms r
    INNER JOIN room_types rt
      ON r."roomTypeId" = rt.id
    LEFT JOIN room_amenities ra
      ON ra."roomId" = r.id
    LEFT JOIN amenities a
      ON a.id = ra."amenityId"
      AND a.status = ${STATUS.ACTIVE}
    ${whereClause}
    GROUP BY
      r.id,
      rt.id,
      rt.name,
      rt.code
    ORDER BY ${safeSortBy} ${safeSortDirection}
    ${limitClause}
  `;
};
