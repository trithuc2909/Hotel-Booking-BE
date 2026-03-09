// MinIO bucket names MUST be lowercase
export const MINIO_BUCKET = {
  IMAGES: "images",
} as const;

// Folder prefixes inside buckets to organize files by type
export const MINIO_FOLDERS = {
  USER: "User",
  HOTEL: "Hotel",
  ROOM: "Room",
} as const;

export const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
