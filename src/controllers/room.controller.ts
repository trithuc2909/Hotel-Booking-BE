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
