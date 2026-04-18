import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as lookupService from "../services/lookup.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";

export const getRoomTypes = catchAsyncErrorWithCode(
  async (_req: Request, res: Response) => {
    const data = await lookupService.getAllRoomTypes();
    res.json(ResponseHelper.success(data, "Lấy danh sách loại phòng thành công"));
  },
  "GET_ROOM_TYPES_ERROR",
);

export const getAmenities = catchAsyncErrorWithCode(
  async (_req: Request, res: Response) => {
    const data = await lookupService.getAllAmenities();
    res.json(ResponseHelper.success(data, "Lấy danh sách tiện nghi thành công"));
  },
  "GET_AMENITIES_ERROR",
);
