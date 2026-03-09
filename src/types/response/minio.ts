export interface UploadFileOptions {
  bucketName: string;
  file: Express.Multer.File;
  folder?: string;
  customFileName?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  originalName: string;
  size: number;
  mimeType: string;
}
