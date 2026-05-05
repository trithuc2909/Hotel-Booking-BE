import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import * as bookingService from "../services/booking.service";
import { AuthenticatedUser } from "../types/request/base";
import { CreateBookingRequest } from "../types/request/booking";

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
