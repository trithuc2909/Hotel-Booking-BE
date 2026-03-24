import { RoomResponse, RoomsFilter } from "../types/response/room";
import * as roomDb from "../db/room.db";
import AppError from "../utils/appError";

export const getAllRooms = async (
  filter: RoomsFilter,
  sortBy?: string,
  sortDirection?: "asc" | "desc",
): Promise<RoomResponse[]> => {
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

  return roomDb.findAllRooms(filter, sortBy, sortDirection);
};
