import { Client as MinioClient } from "minio";
import config from "./index";
import logger from "./logger.config";

export const minioClient = new MinioClient({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
  region: "auto",       // Required for Cloudflare R2
  pathStyle: true,      // Required for Cloudflare R2
});

export async function ensureBucket(bucketName: string): Promise<void> {
  const exists = await minioClient.bucketExists(bucketName);

  if (!exists) {
    await minioClient.makeBucket(bucketName, "auto");
  }

  try {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  } catch (err) {
    logger.warn(`setBucketPolicy skipped (R2 manages public access via dashboard): ${err}`);
  }
}

export function getPublicUrl(_bucketName: string, objectPath: string): string {
  return `${config.minio.publicUrl}/${objectPath}`;
}
