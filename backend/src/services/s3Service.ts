import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  async uploadFile(file: Express.Multer.File, userId: string): Promise<{
    key: string;
    url: string;
    size: number;
  }> {
    const key = `invoices/${userId}/${uuidv4()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId: String(userId),
        originalName: String(file.originalname),
        uploadedAt: new Date().toISOString(),
      },
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    const url = S3_CONFIG.cloudfrontUrl 
      ? `${S3_CONFIG.cloudfrontUrl}/${key}`
      : `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;

    return {
      key,
      url,
      size: file.size,
    };
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    await s3Client.send(command);
  }

  async getUploadPresignedUrl(
    fileName: string, 
    userId: string, 
    expiresIn: number = 300
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `invoices/${userId}/${uuidv4()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      ContentType: 'application/pdf',
      Metadata: { userId: String(userId) },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return { uploadUrl, key };
  }
}