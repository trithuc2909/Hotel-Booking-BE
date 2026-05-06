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

export const uploadUserAvatar = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const file = req.file!;
    const result = await userService.uploadUserAvatar(userId, file);
    res.json(
      ResponseHelper.success(result, "Cập nhật ảnh đại diện thành công"),
    );
  },
  "UPLOAD_AVATAR_ERROR",
);

export const changePassword = catchAsyncErrorWithCode(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    await userService.changeUserPassword(userId, oldPassword, newPassword);
    res.json(ResponseHelper.success(null, "Đổi mật khẩu thành công"));
  },
  "CHANGE_PASSWORD_ERROR",
);
