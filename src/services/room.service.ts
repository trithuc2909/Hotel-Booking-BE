import { RoomResponse, RoomsFilter } from "../types/response/room";
import * as roomDb from "../db/room.db";
import AppError from "../utils/appError";

const ALLOWED_SORT = ["basePrice", "rating", "roomName", "createdOn"];

export const getAllRooms = async (
  filter: RoomsFilter,
): Promise<{
  data: RoomResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
}> => {
  if (filter.checkIn && !filter.checkOut) {
    throw AppError.badRequest(
      "Vui lòng cung cấp ngày trả phòng",
      "CHECKOUT_REQUIRED",
    );
  }

  if (filter.checkOut && !filter.checkIn) {
    throw AppError.badRequest(
      "Vui lòng cung cấp ngày nhận phòng",
      "CHECKIN_REQUIRED",
    );
  }

  if (filter.checkIn && filter.checkOut) {
    const checkIn = new Date(filter.checkIn);
    const checkOut = new Date(filter.checkOut);

    if (checkOut <= checkIn) {
      throw AppError.badRequest(
        "Ngày trả phòng phải sau ngày nhận phòng",
        "INVALID_DATE_RANGE",
      );
    }
  }

  const pageNum = Math.max(1, filter.pageNum ?? 1);
  const pageSize = Math.min(50, Math.max(1, filter.pageSize ?? 9));

  const sortBy = ALLOWED_SORT.includes(filter.sortBy!)
    ? filter.sortBy
    : "createdOn";

  const sortDirection =
    filter.sortDirection === "desc" ? "desc" : "asc";

  return roomDb.findAllRooms({
    ...filter,
    pageNum,
    pageSize,
    sortBy,
    sortDirection,
  });
};