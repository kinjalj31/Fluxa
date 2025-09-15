import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_CONFIG = {
  bucket: process.env.S3_BUCKET_NAME!,
  region: process.env.AWS_REGION || 'us-east-1',
  cloudfrontUrl: process.env.CLOUDFRONT_URL,
  getFileUrl: (bucketName: string, region: string, key: string): string => {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
  }
};