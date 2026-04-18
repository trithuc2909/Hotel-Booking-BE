import * as lookupDb from "../db/lookup.db";

export const getAllRoomTypes = async () => {
  return lookupDb.findAllRoomTypes();
};

export const getAllAmenities = async () => {
  return lookupDb.findAllAmenities();
};
