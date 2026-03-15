import { ROOM_TYPE_CODE } from "../constant/room.constant";
import { STATUS } from "../constant/status.constant";
import { FeaturedRoomResponse } from "../types/response/room";
import prisma from "./prisma";

export const findFeaturedRooms = async (): Promise<FeaturedRoomResponse[]> => {
  return prisma.$queryRaw<FeaturedRoomResponse[]>`
    SELECT
      r.id,
      rt.id                         AS "roomTypeId",
      rt.name                       AS "roomTypeName",
      rt.code                       AS "roomTypeCode",
      r."roomNumber"                AS "roomNumber",
      r."roomName"                  AS "roomName",
      r.notes,
      r."basePrice"                 AS "basePrice",
      r."maxGuests"                 AS "maxGuests",
      r."thumbnailUrl"              AS "thumbnailUrl",
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
      )                             AS "amenities"
    FROM rooms r
    INNER JOIN room_types rt
      ON r."roomTypeId" = rt.id
    LEFT JOIN room_amenities ra
      ON ra."roomId" = r.id
    LEFT JOIN amenities a
      ON a.id = ra."amenityId"
      AND a.status = ${STATUS.ACTIVE}
    WHERE rt.code = ${ROOM_TYPE_CODE.VIP}
    GROUP BY
      r.id, rt.id
    ORDER BY r."createdOn" ASC
    LIMIT ${4}
  `;
};
