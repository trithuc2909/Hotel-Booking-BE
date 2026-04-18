export const MINIO_BUCKET = {
  IMAGES: "images",
} as const;

export const MINIO_FOLDERS = {
  USER: "users",
  HOTEL: "hotels",
  ROOM: "rooms",
} as const;

export const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
