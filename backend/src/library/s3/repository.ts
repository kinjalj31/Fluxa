import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3_CONFIG } from '../../config/aws'

export class S3Repository {
  private client: S3Client
  private bucketName: string

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
    this.bucketName = process.env.S3_BUCKET_NAME!
  }

  async uploadFile(file: Express.Multer.File, userId: string) {
    const key = `invoices/${userId}/${Date.now()}-${file.originalname}`
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })

    await this.client.send(command)

    return {
      key,
      url: S3_CONFIG.getFileUrl(this.bucketName, process.env.AWS_REGION!, key),
      size: file.size
    }
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    })

    return await getSignedUrl(this.client, command, { expiresIn })
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    })

    await this.client.send(command)
  }
}