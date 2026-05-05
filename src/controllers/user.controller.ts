import { catchAsyncErrorWithCode } from "../utils/catchAsyncError";
import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ResponseHelper } from "../utils/response";

export const getMe = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const user = await userService.getMe(userId!);

    res.json(
      ResponseHelper.success(
        user,
        "Lấy thông tin người dùng thành công",
        "GET_ME_SUCCESS",
      ),
    );
  },
  "GET_ME_ERROR",
);

export const updateUserProfile = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await userService.updateUserProfile(userId, req.body);

    res.json(ResponseHelper.success(profile, "Cập nhật hồ sơ thành công"));
  },
  "UPDATE_USER_PROFILE_ERROR",
);
