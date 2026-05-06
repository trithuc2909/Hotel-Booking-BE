import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import * as roomService from "../services/room.service";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import {
  CreateRoomRequest,
  MulterFiles,
  UpdateRoomRequest,
} from "../types/request/room";

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

export const updateRoomStatus = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;

    await roomService.updateRoomStatus({ id, status });

    res.json(
      ResponseHelper.success(null, "Cập nhật trạng thái phòng thành công"),
    );
  },
  "UPDATE_ROOM_STATUS_ERROR",
);

export const deleteRoomById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    await roomService.deleteRoomById(id);

    res.json(ResponseHelper.success(null, "Xóa phòng thành công"));
  },
  "DELETE_ROOM_ERROR",
);

export const createRoom = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const body = matchedData(req, { locations: ["body"] }) as CreateRoomRequest;
    const files = req.files as MulterFiles;
    await roomService.createRoom(body, files);
    res.status(201).json(ResponseHelper.success(null, "Tạo phòng thành công"));
  },
  "CREATE_ROOM_ERROR",
);

export const getAdminRoomById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const room = await roomService.getAdminRoomById(id);
    res.json(ResponseHelper.success(room, "Lấy thông tin phòng thành công"));
  },
  "GET_ADMIN_ROOM_BY_ID_ERROR",
);

export const updateRoom = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const body = matchedData(req, { locations: ["body"] }) as UpdateRoomRequest;
    const files = req.files as MulterFiles;
    await roomService.updateRoom(id, body, files);
    res.json(ResponseHelper.success(null, "Cập nhật phòng thành công"));
  },
  "UPDATE_ROOM_ERROR",
);

export const getAvailableRooms = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const { checkInDate, checkOutDate, guests, excludeRoomId } = req.query;

    const result = await roomService.getAvailableRooms({
      checkInDate: String(checkInDate),
      checkOutDate: String(checkOutDate),
      guests: Number(guests),
      excludeRoomId: excludeRoomId ? String(excludeRoomId) : undefined,
    });

    res.json(
      ResponseHelper.success(result, "Lấy danh sách phòng khả dụng thành công"),
    );
  },
  "GET_AVAILABLE_ROOMS_ERROR",
);

export const getOccupiedDateRangesForRoom = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const roomId = String(req.params.id);
    const result = await roomService.getOccupiedDateRangesForRoom(roomId);
    res.json(
      ResponseHelper.success(result, "Lấy danh sách phòng khả dụng thành công"),
    );
  },
  "GET_OCCUPIED_DATE_RANGES_FOR_ROOM_ERROR",
);
