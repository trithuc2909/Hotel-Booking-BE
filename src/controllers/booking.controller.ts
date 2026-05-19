import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response";
import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { matchedData } from "express-validator";
import * as bookingService from "../services/booking.service";
import { AuthenticatedUser } from "../types/request/base";
import { CreateBookingRequest } from "../types/request/booking";
import { BookingStatus } from "@prisma/client";
import { AdminBookingsFilter } from "../types/response/booking";

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

export const getAdminBookings = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const filter: AdminBookingsFilter = {
      pageNum: req.query.pageNum ? parseInt(req.query.pageNum as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 5,
      sortBy: req.query.sortBy as string,
      sortDirection: req.query.sortDirection as "asc" | "desc",
      status: req.query.status as string,
      search: req.query.search as string,
      checkInDate: req.query.checkInDate as string,
      checkOutDate: req.query.checkOutDate as string,
    };
    const result = await bookingService.getAdminBookings(filter);
    res
      .status(200)
      .json(
        ResponseHelper.success(
          result,
          "Lấy danh sách đặt phòng thành công",
          "GET_ADMIN_BOOKINGS_SUCCESS",
        ),
      );
  },
  "GET_ADMIN_BOOKINGS_ERROR",
);

export const getBookingAnalytics = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const result = await bookingService.getBookingAnalytics();
    res
      .status(200)
      .json(
        ResponseHelper.success(
          result,
          "Lấy dữ liệu thống kê thành công",
          "GET_BOOKING_ANALYTICS_SUCCESS",
        ),
      );
  },
  "GET_BOOKING_ANALYTICS_ERROR",
);

export const updateBookingStatus = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { status } = req.body;
    await bookingService.updateBookingStatus(id, status as BookingStatus);
    res.json(ResponseHelper.success(null, "Cập nhật trạng thái thành công"));
  },
  "UPDATE_BOOKING_STATUS_ERROR",
);

export const exportAdminBookings = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const filter = {
      sortBy: req.query.sortBy as string,
      sortDirection: req.query.sortDirection as "asc" | "desc",
      status: req.query.status as string,
      search: req.query.search as string,
      checkInDate: req.query.checkInDate as string,
      checkOutDate: req.query.checkOutDate as string,
    };
    const result = await bookingService.exportAdminBookings(filter);
    res
      .status(200)
      .json(
        ResponseHelper.success(result, "Lấy dữ liệu xuất Excel thành công"),
      );
  },
);
