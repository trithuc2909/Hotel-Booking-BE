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

    const result = await roomService.getAllRooms(data);

    res.json(
      ResponseHelper.paginated(
        result.data,
        result.total,
        result.pageNum,
        result.pageSize,
        "Lấy danh sách phòng thành công",
      ),
    );
  },
  "GET_ROOMS_ERROR",
);

export const getAdminRooms = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const data = matchedData(req, {
      locations: ["query"],
    });

    const result = await roomService.getAdminRooms(data);

    res.json(
      ResponseHelper.paginated(
        result.data,
        result.total,
        result.pageNum,
        result.pageSize,
        "Lấy danh sách phòng thành công",
      ),
    );
  },
  "GET_ADMIN_ROOMS_ERROR",
);

export const getRoomById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const room = await roomService.getRoomById(id);

    res.json(ResponseHelper.success(room, "Lấy thông tin phòng thành công"));
  },
  "GET_ROOM_BY_ID_ERROR",
);
