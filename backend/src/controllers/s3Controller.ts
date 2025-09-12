import { Request, Response } from 'express';
import { S3Service } from '../services/s3Service';

export class S3Controller {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  // Get presigned URL for direct upload from frontend
  getUploadUrl = async (req: Request, res: Response) => {
    try {
      const { fileName, userId } = req.body;

      if (!fileName || !userId) {
        return res.status(400).json({ error: 'fileName and userId are required' });
      }

      const result = await this.s3Service.getUploadPresignedUrl(fileName, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get upload URL error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  };

  // Get presigned URL for file download
  getDownloadUrl = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const expiresIn = parseInt(req.query.expires as string) || 3600;

      if (!key) {
        return res.status(400).json({ error: 'S3 key is required' });
      }

      const downloadUrl = await this.s3Service.getPresignedUrl(key, expiresIn);

      res.json({
        success: true,
        data: { downloadUrl }
      });
    } catch (error) {
      console.error('Get download URL error:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  };
}