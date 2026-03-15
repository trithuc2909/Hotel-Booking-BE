import { Request, Response, NextFunction } from "express";
import { ResponseHelper } from "../utils/response";
import * as roomService from "../services/room.service";

export const getFeaturedRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await roomService.getFeaturedRooms();
    res
      .status(200)
      .json(
        ResponseHelper.success(
          result,
          "Lấy danh sách phòng tiêu biểu thành công",
          "GET_FEATURED_ROOMS_SUCCESS",
        ),
      );
  } catch (error) {
    next(error);
  }
};
