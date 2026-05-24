import {
  RoomDetailResponse,
  RoomResponse,
  RoomsFilter,
} from "../types/response/room";
import * as roomDb from "../db/room.db";
import AppError from "../utils/appError";
import { ROOM_STATUS, RoomStatusCode } from "../constant/room.constant";
import {
  CreateRoomRequest,
  MulterFiles,
  UpdateRoomRequest,
  UpdateRoomStatusRequest,
  AvailableRoomsRequest,
} from "../types/request/room";
import prisma from "../db/prisma";
import { minioService } from "./minio.service";
import { v4 as uuidv4 } from "uuid";
import { BookingStatus } from "@prisma/client";
import { STATUS_TYPE } from "../constant/status.constant";
import { resolveRoomDisplayStatus } from "../utils/roomStatusResolver";

const ALLOWED_SORT = ["basePrice", "rating", "roomName", "createdOn"];

export const getAllRooms = async (
  filter: RoomsFilter,
): Promise<{
  data: RoomResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
}> => {
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

  const pageNum = Math.max(1, filter.pageNum ?? 1);
  const pageSize = Math.min(50, Math.max(1, filter.pageSize ?? 9));

  const sortBy = ALLOWED_SORT.includes(filter.sortBy!)
    ? filter.sortBy
    : "createdOn";

  const sortDirection = filter.sortDirection === "desc" ? "desc" : "asc";

  return roomDb.findAllRooms({
    ...filter,
    pageNum,
    pageSize,
    sortBy,
    sortDirection,
    status: filter.status ?? (filter.checkIn || filter.checkOut ? ROOM_STATUS.AVAILABLE : undefined),
  });
};

export const getRoomById = async (id: string): Promise<RoomDetailResponse> => {
  const room = await roomDb.findRoomById(id);

  if (!room) throw AppError.notFound("Không tìm thấy phòng", "ROOM_NOT_FOUND");

  return room;
};

export const getAdminRooms = async (filter: RoomsFilter) => {
  const pageNum = Math.max(1, filter.pageNum ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 9));
  const sortBy = ALLOWED_SORT.includes(filter.sortBy!)
    ? filter.sortBy
    : "createdOn";
  const sortDirection = filter.sortDirection === "desc" ? "desc" : "asc";
  const result = await roomDb.findAllRoomsForAdmin({
    ...filter,
    pageNum,
    pageSize,
    sortBy,
    sortDirection,
  });
  const statusCodes = await prisma.code.findMany({
    where: { type: STATUS_TYPE.ROOM_STATUS, isActive: true },
    select: { code: true, displayAs: true },
  });
  const statusLabelMap = Object.fromEntries(
    statusCodes.map((c) => [c.code, c.displayAs]),
  );
  const now = new Date();
  const enrichedData = result.data.map((room: any) => {
    const displayStatus = resolveRoomDisplayStatus({
      physicalStatus: room.status,
      activeBooking: room.activeBooking ?? null,
      upcomingBooking: room.upcomingBooking ?? null,
      now,
    });
    return {
      ...room,
      displayStatus,
      displayStatusLabel: statusLabelMap[displayStatus] ?? null,
      activeBooking: undefined,
      upcomingBooking: undefined,
    };
  });
  return {
    ...result,
    data: enrichedData,
  };
};

export const updateRoomStatus = async (
  request: UpdateRoomStatusRequest,
): Promise<void> => {
  const room = await roomDb.findRoomByIdForAdmin(request.id);

  if (!room) throw AppError.notFound("Không tìm thấy phòng", "ROOM_NOT_FOUND");

  const validStatus = await prisma.code.findFirst({
    where: {
      type: "ROOM_STATUS",
      code: request.status,
      isActive: true,
    },
  });

  if (!validStatus)
    throw AppError.badRequest("Trạng thái không hợp lệ", "INVALID_STATUS");

  const allowedTransitions = {
    AVL: ["CLN", "MNT"],
    CLN: ["AVL"],
    MNT: ["AVL"],
  };

  const currentStatus = room.status as RoomStatusCode;

  if (!allowedTransitions[currentStatus]?.includes(request.status)) {
    throw AppError.badRequest(
      "Không thể chuyển đổi trạng thái",
      "INVALID_TRANSITION",
    );
  }
  await roomDb.updateRoomStatus(request);
};

export const deleteRoomById = async (id: string): Promise<void> => {
  const room = await roomDb.findRoomByIdForAdmin(id);
  if (!room) throw AppError.notFound("Không tìm thấy phòng", "ROOM_NOT_FOUND");

  const hasActiveBooking = await prisma.bookingRoom.findFirst({
    where: {
      roomId: id,
      booking: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
        },
        checkOutDate: { gt: new Date() },
      },
    },
  });

  if (hasActiveBooking) {
    throw AppError.badRequest(
      "Không thể xóa phòng đang có lịch đặt",
      "ROOM_HAS_BOOKING",
    );
  }
  await roomDb.deleteRoomById(id);
};

export const createRoom = async (
  data: CreateRoomRequest,
  files: MulterFiles,
): Promise<void> => {
  const existingRoomNumber = await prisma.room.findFirst({
    where: { roomNumber: data.roomNumber, isDeleted: false },
  });

  if (existingRoomNumber) {
    throw AppError.conflict("Mã phòng đã tồn tại", "ROOM_NUMBER_EXISTED");
  }

  const existingRoomName = await prisma.room.findFirst({
    where: { roomName: data.roomName, isDeleted: false },
  });

  if (existingRoomName)
    throw AppError.conflict("Tên phòng đã tồn tại", "ROOM_NAME_EXISTED");

  const firstDigit = parseInt(data.roomNumber[0]);
  if (firstDigit !== data.floor) {
    throw AppError.badRequest(
      "Số phòng không khớp với tầng",
      "INVALID_ROOM_NUMBER",
    );
  }

  const roomId = uuidv4();

  const thumbnailFiles = files["thumbnailUrl"] as
    | Express.Multer.File[]
    | undefined;
  const imageFiles =
    (files["imageUrls"] as Express.Multer.File[] | undefined) ?? [];

  const { thumbnailUrl, imageUrls } = await minioService.uploadRoomImages(
    roomId,
    thumbnailFiles?.[0],
    imageFiles,
  );

  await roomDb.createRoom(roomId, {
    ...data,
    thumbnailUrl,
    imageUrls,
  });
};

export const updateRoom = async (
  id: string,
  data: UpdateRoomRequest,
  files: MulterFiles,
): Promise<void> => {
  const room = await prisma.room.findFirst({
    where: { id, isDeleted: false },
  });

  if (!room) throw AppError.notFound("Không tìm thấy phòng", "ROOM_NOT_FOUND");
  const existingImages = await prisma.roomImage.findMany({
    where: { roomId: id },
    select: { imageUrl: true },
  });

  const oldImageUrls = existingImages.map((img) => img.imageUrl);
  const imagesToDelete = await prisma.roomImage.findMany({
    where: {
      roomId: id,
      id: { in: data.deleteImageIds ?? [] },
    },
    select: { imageUrl: true },
  });
  const deleteImageUrls = imagesToDelete.map((img) => img.imageUrl);

  if (data.roomNumber && data.roomNumber !== room.roomNumber) {
    const existing = await prisma.room.findFirst({
      where: { roomNumber: data.roomNumber, isDeleted: false, NOT: { id } },
    });
    if (existing)
      throw AppError.conflict("Mã phòng đã tồn tại", "ROOM_NUMBER_EXISTED");
  }

  const thumbnailFile = (
    files["thumbnailUrl"] as Express.Multer.File[] | undefined
  )?.[0];
  const imageFiles =
    (files["imageUrls"] as Express.Multer.File[] | undefined) ?? [];

  let thumbnailUrl = room.thumbnailUrl ?? "";

  const deleteUrlSet = new Set(deleteImageUrls);
  let imageUrls: string[] = oldImageUrls.filter(
    (url) => !deleteUrlSet.has(url),
  );

  let uploaded: { thumbnailUrl?: string; imageUrls?: string[] } | null = null;

  if (thumbnailFile || imageFiles.length > 0) {
    uploaded = await minioService.uploadRoomImages(
      id,
      thumbnailFile,
      imageFiles,
    );
    if (uploaded.thumbnailUrl) thumbnailUrl = uploaded.thumbnailUrl;
    if (uploaded.imageUrls?.length) imageUrls = uploaded.imageUrls;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await roomDb.updateRoomTx(tx, id, { ...data, thumbnailUrl, imageUrls });
    });
  } catch (error) {
    if (uploaded) {
      await minioService.deleteRoomImages({
        thumbnailUrl: uploaded.thumbnailUrl,
        imageUrls: uploaded.imageUrls ?? [],
      });
    }
    throw error;
  }

  if (uploaded) {
    const oldThumbChanged =
      uploaded.thumbnailUrl &&
      uploaded.thumbnailUrl !== (room.thumbnailUrl ?? "");
    await minioService.deleteRoomImages({
      thumbnailUrl: oldThumbChanged ? room.thumbnailUrl : undefined,
      imageUrls: uploaded.imageUrls?.length ? oldImageUrls : [],
    });
  }

  if (deleteImageUrls.length > 0) {
    await minioService.deleteRoomImages({
      thumbnailUrl: undefined,
      imageUrls: deleteImageUrls,
    });
  }
};

export const getAdminRoomById = async (
  id: string,
): Promise<RoomDetailResponse> => {
  const room = await roomDb.findRoomByIdForAdmin(id);
  if (!room) throw AppError.notFound("Không tìm thấy phòng", "ROOM_NOT_FOUND");
  return room;
};

export const getAvailableRooms = async (request: AvailableRoomsRequest) => {
  return roomDb.findAvailableRooms(request);
};

export const getOccupiedDateRangesForRoom = async (roomId: string) => {
  return roomDb.findOccupiedDateRangesForRoom(roomId);
};
