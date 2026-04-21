import { Prisma } from "@prisma/client";
import { STATUS, STATUS_TYPE } from "../constant/status.constant";
import {
  FindAllRoomsResponse,
  RoomDetailResponse,
  RoomResponse,
  RoomsFilter,
} from "../types/response/room";
import prisma from "./prisma";
import { ROOM_STATUS } from "../constant/room.constant";
import {
  CreateRoomRequest,
  UpdateRoomRequest,
  UpdateRoomStatusRequest,
} from "../types/request/room";
import { ROLE_CONSTANTS } from "../constant/common.constant";

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const SORT_COLUMNS_MAP: Record<string, Prisma.Sql> = {
  basePrice: Prisma.sql`r."basePrice"`,
  rating: Prisma.sql`r."rating"`,
  roomName: Prisma.sql`r."roomName"`,
  createdOn: Prisma.sql`r."createdOn"`,
};

const buildWhereClause = (filter: RoomsFilter): Prisma.Sql => {
  const conditions: Prisma.Sql[] = [];

  conditions.push(Prisma.sql`r."isDeleted" = false`);

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

  if (filter.status) {
    conditions.push(Prisma.sql`r.status = ${filter.status}`);
  }

  if (filter.search?.trim()) {
    const search = filter.search.trim().replace(/[%_]/g, "\\$&");
    const keyword = `%${search}%`;

    conditions.push(
      Prisma.sql`
      (
        r."roomName" ILIKE ${keyword}
        OR r."roomNumber" ILIKE ${keyword}
      )
    `,
    );
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

  const whereClause = buildWhereClause(filter);
  const safeSortBy = SORT_COLUMNS_MAP[sortBy!] ?? Prisma.sql`r."createdOn"`;
  const safeSortDirection =
    sortDirection === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

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
      c."displayAs" AS "statusLabel",
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
    LEFT JOIN codes c ON c.code = r.status AND c.type = ${STATUS_TYPE.ROOM_STATUS}
    ${whereClause}
    GROUP BY r.id, rt.id, rt.name, rt.code, c."displayAs"
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

export const findRoomById = async (
  id: string,
): Promise<RoomDetailResponse | null> => {
  const result = await prisma.$queryRaw<RoomDetailResponse[]>`
SELECT
      r.id,
      rt.id    AS "roomTypeId",
      rt.name  AS "roomTypeName",
      rt.code  AS "roomTypeCode",
      r."roomNumber",
      r."roomName",
      r.floor,
      r.size,
      r."bedType",
      r.view,
      r.balcony,
      r.notes,
      r.description,
      r."basePrice",
      r."maxGuests",
      r."thumbnailUrl",
      r.status,
      r.rating,
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', a.id, 'name', a.name, 'icon', a.icon)
            ORDER BY a.name
          ),
          '[]'::json
        )
        FROM room_amenities ra
        JOIN amenities a
          ON a.id = ra."amenityId"
          AND a.status = ${STATUS.ACTIVE}
        WHERE ra."roomId" = r.id
      ) AS "amenities",
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',           ri.id,
              'imageUrl',     ri."imageUrl",
              'displayOrder', ri."displayOrder"
            )
            ORDER BY ri."displayOrder"
          ),
          '[]'::json
        )
        FROM room_images ri
        WHERE ri."roomId" = r.id
      ) AS "imageUrls"
    FROM rooms r
    INNER JOIN room_types rt ON r."roomTypeId" = rt.id
    WHERE r.id = ${id}
      AND r."isDeleted" = false
      AND r.status = ${ROOM_STATUS.AVAILABLE}
    LIMIT 1
  `;

  return result[0] ?? null;
};

export const findRoomByIdForAdmin = async (
  id: string,
): Promise<RoomDetailResponse | null> => {
  const result = await prisma.$queryRaw<RoomDetailResponse[]>`
    SELECT
      r.id,
      rt.id    AS "roomTypeId",
      rt.name  AS "roomTypeName",
      rt.code  AS "roomTypeCode",
      r."roomNumber",
      r."roomName",
      r.floor,
      r.size,
      r."bedType",
      r.view,
      r.balcony,
      r.notes,
      r.description,
      r."basePrice",
      r."maxGuests",
      r."thumbnailUrl",
      r.status,
      r.rating,
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', a.id, 'name', a.name, 'icon', a.icon)
            ORDER BY a.name
          ),
          '[]'::json
        )
        FROM room_amenities ra
        JOIN amenities a
          ON a.id = ra."amenityId"
          AND a.status = ${STATUS.ACTIVE}
        WHERE ra."roomId" = r.id
      ) AS "amenities",
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',           ri.id,
              'imageUrl',     ri."imageUrl",
              'displayOrder', ri."displayOrder"
            )
            ORDER BY ri."displayOrder"
          ),
          '[]'::json
        )
        FROM room_images ri
        WHERE ri."roomId" = r.id
      ) AS "imageUrls"
    FROM rooms r
    INNER JOIN room_types rt ON r."roomTypeId" = rt.id
    WHERE r.id = ${id}
      AND r."isDeleted" = false
    LIMIT 1
  `;

  return result[0] ?? null;
};

export const updateRoomStatus = async (
  request: UpdateRoomStatusRequest,
): Promise<void> => {
  await prisma.room.update({
    where: { id: request.id },
    data: { status: request.status },
  });
};

export const deleteRoomById = async (id: string): Promise<void> => {
  await prisma.room.update({
    where: { id },
    data: {
      isDeleted: true,
      modifiedOn: new Date(),
      modifiedBy: ROLE_CONSTANTS.ADMIN,
    },
  });
};

export const createRoom = async (
  id: string,
  data: CreateRoomRequest,
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    await tx.room.create({
      data: {
        id,
        roomName: data.roomName,
        roomNumber: data.roomNumber,
        roomTypeId: data.roomTypeId,
        basePrice: data.basePrice,
        floor: data.floor,
        maxGuests: data.maxGuests,
        balcony: data.balcony ?? false,
        size: data.size,
        bedType: data.bedType,
        view: data.view,
        description: data.description,
        notes: data.notes,
        thumbnailUrl: data.thumbnailUrl,
        status: ROOM_STATUS.AVAILABLE,
        createdBy: ROLE_CONSTANTS.ADMIN,
      },
    });

    if (data.amenityIds?.length) {
      await tx.roomAmenity.createMany({
        data: data.amenityIds.map((amenityId) => ({
          roomId: id,
          amenityId,
        })),
      });
    }

    if (data.imageUrls?.length) {
      await tx.roomImage.createMany({
        data: data.imageUrls.map((url, index) => ({
          roomId: id,
          imageUrl: url,
          displayOrder: index + 1,
        })),
      });
    }
  });
};

export const updateRoomTx = async (
  tx: PrismaTx,
  id: string,
  data: UpdateRoomRequest,
): Promise<void> => {
  await tx.room.update({
    where: { id },
    data: {
      roomName: data.roomName,
      roomNumber: data.roomNumber,
      roomTypeId: data.roomTypeId,
      basePrice: data.basePrice,
      floor: data.floor,
      maxGuests: data.maxGuests,
      balcony: data.balcony ?? false,
      size: data.size,
      bedType: data.bedType,
      view: data.view,
      description: data.description,
      notes: data.notes,
      thumbnailUrl: data.thumbnailUrl,
      modifiedOn: new Date(),
      modifiedBy: ROLE_CONSTANTS.ADMIN,
    },
  });

  await tx.roomAmenity.deleteMany({ where: { roomId: id } });
  if (data.amenityIds?.length) {
    await tx.roomAmenity.createMany({
      data: data.amenityIds.map((amenityId) => ({ roomId: id, amenityId })),
    });
  }

  if (data.imageUrls?.length) {
    await tx.roomImage.deleteMany({ where: { roomId: id } });
    await tx.roomImage.createMany({
      data: data.imageUrls.map((url, index) => ({
        roomId: id,
        imageUrl: url,
        displayOrder: index + 1,
      })),
    });
  }

  if (data.deleteImageIds?.length) {
    await tx.roomImage.deleteMany({
      where: {
        id: { in: data.deleteImageIds },
        roomId: id,
      },
    });
  }
};
