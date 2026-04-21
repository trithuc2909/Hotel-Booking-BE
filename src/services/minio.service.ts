import { v4 as uuidv4 } from "uuid";
import { getPublicUrl, minioClient } from "../config/minio.config";
import {
  MIME_EXTENSION_MAP,
  MINIO_BUCKET,
  MINIO_FOLDERS,
} from "../constant/minio.constant";
import { UploadFileOptions, UploadResult } from "../types/response/minio";
import logger from "../config/logger.config";

function getExtensionFromMime(mime: string): string {
  return MIME_EXTENSION_MAP[mime] || "jpg";
}

class MinioService {
  private extractKeyFromUrl(url: string): string | null {
    try {
      const { pathname } = new URL(url);

      const parts = pathname.split("/").filter(Boolean);

      if (parts.length < 2) return null;

      const [bucket, ...keyParts] = parts;

      if (bucket !== MINIO_BUCKET.IMAGES) return null;

      return keyParts.join("/");
    } catch (error) {
      logger.error("Url không hợp lệ khi truy xuất khóa", { url, error });
      return null;
    }
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const { bucketName, file, folder = "", customFileName } = options;

    const extension = getExtensionFromMime(file.mimetype);
    const fileName = customFileName ?? `${uuidv4()}.${extension}`;

    const filePath = folder ? `${folder}/${fileName}` : fileName;

    await minioClient.putObject(bucketName, filePath, file.buffer, file.size, {
      "Content-Type": file.mimetype,
      "Original-Name": encodeURIComponent(file.originalname),
    });

    return {
      url: getPublicUrl(bucketName, filePath),
      key: filePath,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    await minioClient.removeObject(bucketName, key);
  }

  async uploadHotelImage(
    hotelId: string,
    file: Express.Multer.File,
    isThumbnail: boolean,
    imageIndex?: number,
  ): Promise<UploadResult> {
    const folder = `${MINIO_FOLDERS.HOTEL}/${hotelId}`;
    const extension = getExtensionFromMime(file.mimetype);

    let customFileName: string;
    if (isThumbnail) {
      customFileName = `thumbnail.${extension}`;
    } else if (imageIndex !== undefined) {
      customFileName = `image-${imageIndex}.${extension}`;
    } else {
      customFileName = `${uuidv4()}.${extension}`;
    }

    return this.uploadFile({
      bucketName: MINIO_BUCKET.IMAGES,
      file,
      folder,
      customFileName,
    });
  }

  async uploadHotelImages(
    hotelId: string,
    files: Express.Multer.File[],
  ): Promise<{ thumbnailUrl?: string; imageUrls: string[] }> {
    const validFiles = files.filter(
      (file) => file && file.size > 0 && file.buffer && file.buffer.length > 0,
    );

    if (validFiles.length === 0) {
      return { thumbnailUrl: undefined, imageUrls: [] };
    }

    const uploadPromises = validFiles.map((file, i) => {
      const isThumbnail = i === 0;
      const imageIndex = isThumbnail ? undefined : i;

      return this.uploadHotelImage(hotelId, file, isThumbnail, imageIndex);
    });

    const results = await Promise.all(uploadPromises);

    let thumbnailUrl: string | undefined;
    const imageUrls: string[] = [];

    results.forEach((result, i) => {
      if (i === 0) thumbnailUrl = result.url;
      else imageUrls.push(result.url);
    });

    return { thumbnailUrl, imageUrls };
  }

  async deleteOldHotelImages(
    oldThumbnailKey: string | null,
    oldImageKeys: string[],
    newThumbnailKey: string | null | undefined,
    newImageKeys: string[],
  ): Promise<void> {
    const deleteTasks: Promise<void>[] = [];

    // delete old thumbnail
    if (oldThumbnailKey && oldThumbnailKey !== newThumbnailKey) {
      deleteTasks.push(
        this.deleteFile(MINIO_BUCKET.IMAGES, oldThumbnailKey).catch((error) => {
          logger.error(
            `MinioService Failed to delete old thumbnail: ${oldThumbnailKey}`,
            error,
          );
        }),
      );
    }

    // find images that need to delete
    const keysToDelete = oldImageKeys.filter(
      (key) => !newImageKeys.includes(key),
    );

    for (const key of keysToDelete) {
      deleteTasks.push(
        this.deleteFile(MINIO_BUCKET.IMAGES, key).catch((error) => {
          logger.error(
            `MinioService Failed to delete old image: ${key}`,
            error,
          );
        }),
      );
    }

    await Promise.all(deleteTasks);
  }

  async uploadUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    const folder = `${MINIO_FOLDERS.USER}/${userId}`;
    const extension = getExtensionFromMime(file.mimetype);
    const customFileName = `avatar.${extension}`;

    return this.uploadFile({
      bucketName: MINIO_BUCKET.IMAGES,
      file,
      folder,
      customFileName,
    });
  }

  async uploadRoomImage(
    roomId: string,
    file: Express.Multer.File,
    isThumbnail: boolean,
    imageIndex?: number,
  ): Promise<UploadResult> {
    const folder = `${MINIO_FOLDERS.ROOM}/${roomId}`;
    const extension = getExtensionFromMime(file.mimetype);

    let customFileName: string;
    if (isThumbnail) {
      customFileName = `thumbnail.${extension}`;
    } else if (imageIndex !== undefined) {
      customFileName = `image-${imageIndex}.${extension}`;
    } else {
      customFileName = `${uuidv4()}.${extension}`;
    }

    return this.uploadFile({
      bucketName: MINIO_BUCKET.IMAGES,
      file,
      folder,
      customFileName,
    });
  }

  async uploadRoomImages(
    roomId: string,
    thumbnail: Express.Multer.File | undefined,
    images: Express.Multer.File[],
  ): Promise<{ thumbnailUrl?: string; imageUrls: string[] }> {
    const hasThumb = !!thumbnail && thumbnail.size > 0;
    const validImgs = images.filter(
      (f) => f && f.size > 0 && f.buffer?.length > 0,
    );

    if (!hasThumb && validImgs.length === 0) {
      return { thumbnailUrl: undefined, imageUrls: [] };
    }

    const uploadTasks: Promise<UploadResult>[] = [];

    if (hasThumb) {
      uploadTasks.push(this.uploadRoomImage(roomId, thumbnail!, true));
    }

    validImgs.forEach((file, index) => {
      uploadTasks.push(this.uploadRoomImage(roomId, file, false, index + 1));
    });

    const results = await Promise.all(uploadTasks);

    let thumbnailUrl: string | undefined;
    const imageUrls: string[] = [];

    results.forEach((result, i) => {
      if (hasThumb && i === 0) thumbnailUrl = result.url;
      else imageUrls.push(result.url);
    });

    return { thumbnailUrl, imageUrls };
  }

  async deleteRoomImages(params: {
    thumbnailUrl?: string | null;
    imageUrls: string[];
  }) {
    const deleteTasks: Promise<void>[] = [];

    // delete thumbnail
    if (params.thumbnailUrl) {
      const key = this.extractKeyFromUrl(params.thumbnailUrl);

      if (key) {
        deleteTasks.push(
          this.deleteFile(MINIO_BUCKET.IMAGES, key).catch((err) => {
            logger.error(`Xóa ảnh chính thất bại: ${key}`, err);
          }),
        );
      }
    }

    // delete images
    for (const url of params.imageUrls ?? []) {
      const key = this.extractKeyFromUrl(url);

      if (key) {
        deleteTasks.push(
          this.deleteFile(MINIO_BUCKET.IMAGES, key).catch((err) => {
            logger.error(`Failed to delete room image: ${key}`, err);
          }),
        );
      }
    }

    if (deleteTasks.length === 0) return;

    await Promise.all(deleteTasks);
  }

  async deleteRoomFolder(roomId: string): Promise<void> {
    const prefix = `${MINIO_FOLDERS.ROOM}/${roomId}/`;

    const objectKeys: string[] = await new Promise((resolve, reject) => {
      const keys: string[] = [];

      const stream = minioClient.listObjects(MINIO_BUCKET.IMAGES, prefix, true);

      stream.on("data", (obj) => {
        if (obj.name) keys.push(obj.name);
      });

      stream.on("end", () => resolve(keys));
      stream.on("error", (err) => {
        logger.error("Lỗi khi liệt kê các đối tượng cần xóa", err);
        reject(err);
      });
    });

    if (objectKeys.length === 0) return;

    await Promise.all(
      objectKeys.map((key) =>
        this.deleteFile(MINIO_BUCKET.IMAGES, key).catch((err) => {
          logger.error(`Lỗi khi xóa phòng: ${key}`, err);
        }),
      ),
    );
  }
}

export const minioService = new MinioService();
