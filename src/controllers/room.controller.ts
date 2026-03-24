import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as roomService from "../services/room.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";

export const getAllRooms = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const data = matchedData(req, {
      locations: ["query"],
    });

    const rooms = await roomService.getAllRooms(
      {
        roomTypeCode: data.roomTypeCode,
        guests: data.guests,
        limit: data.limit,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      },
      data.sortBy,
      data.sortDirection,
    );

    res.json(
      ResponseHelper.success(
        rooms,
        "Lấy danh sách phòng thành công",
        "GET_ROOMS_SUCCESS",
      ),
    );
  },
  "GET_ROOMS_ERROR",
);
