import { FeaturedRoomResponse } from "../types/response/room";
import * as roomDb from "../db/room.db";

export const getFeaturedRooms = async (): Promise<FeaturedRoomResponse[]> => {
  return roomDb.findFeaturedRooms();
};