import * as lookupDb from "../db/lookup.db";
import AppError from "../utils/appError";

export const getAllRoomTypes = async () => {
  return lookupDb.findAllRoomTypes();
};

export const getAllAmenities = async () => {
  return lookupDb.findAllAmenities();
};

export const getCodesByType = async (type: string) => {
  if (!type) throw AppError.badRequest("Thiếu tham số type", "MISSING_TYPE");
  return lookupDb.findCodesByType(type);
};