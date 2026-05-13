import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import * as bookingService from "../services/booking.service";
import { AuthenticatedUser } from "../types/request/base";
import { CreateBookingRequest } from "../types/request/booking";
import { BookingStatus } from "@prisma/client";

export const createBooking = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const body = matchedData(req, { locations: ["body"] });

    const booking = await bookingService.createBooking({
      ...body,
      userId: user.id,
      checkInDate: new Date(String(body.checkInDate)),
      checkOutDate: new Date(String(body.checkOutDate)),
      rooms: body.rooms ?? [],
      services: body.services ?? [],
    } as CreateBookingRequest);

    res.status(201).json(
      ResponseHelper.success(
        {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          totalAmount: booking.totalAmount,
          expiresAt: booking.expiresAt,
          status: booking.status,
        },
        "Tạo booking thành công",
      ),
    );
  },
  "CREATE_BOOKING_ERROR",
);

export const getBookingById = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const id = String(req.params.id);

    const booking = await bookingService.getBookingById(id, user.id);

    res.json(
      ResponseHelper.success(booking, "Lấy thông tin booking thành công"),
    );
  },
  "GET_BOOKING_ERROR",
);

export const getBookingHistory = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;

    const status = req.query.status as BookingStatus | undefined;

    const history = await bookingService.getBookingHistory(user.id, status);

    res.json(
      ResponseHelper.success(history, "Lấy lịch sử đặt phòng thành công"),
    );
  },
  "GET_BOOKING_HISTORY_ERROR",
);

export const cancelBooking = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const id = String(req.params.id);

    await bookingService.cancelBooking(id, user.id);

    res.json(ResponseHelper.success(null, "Hủy booking thành công"));
  },
  "CANCEL_BOOKING_ERROR",
);
