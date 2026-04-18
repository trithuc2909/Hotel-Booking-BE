import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Always store in memory
const storage = multer.memoryStorage();

// image config
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận ảnh JPEG, JPG, PNG, WEBP"));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

// Upload 1 image
export const uploadSingleImage = upload.single("image");

// Upload multiple images
export const uploadMultipleImages = upload.array("images", 10);

export const uploadHotelImages = upload.fields([
  { name: "thumbnailUrl", maxCount: 1 },
  { name: "imageUrls", maxCount: 9 },
]);

export const uploadRoomImages = upload.fields([
  { name: "thumbnailUrl", maxCount: 1 },
  { name: "imageUrls", maxCount: 4 },
]);
