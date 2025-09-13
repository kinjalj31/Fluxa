import { S3Infrastructure } from '../library/infrastructure'

const COMPONENT = 'FilesStorageWorkflows'

export interface UploadFileRequest {
  file: Express.Multer.File
  userId: string
}

export interface S3UploadResult {
  key: string
  url: string
  size: number
}

/**
 * Files Storage Workflows
 * Handles all S3 storage operations following hiring-force patterns
 */
export class FilesStorageWorkflows {

  /**
   * Upload file to S3 storage
   * Following hiring-force S3 upload patterns
   * 
   * Flow:
   * 1. Validate upload request
   * 2. Initialize S3 storage
   * 3. Upload file to S3
   * 4. Return S3 result (key, url, size)
   */
  static async upload(uploadRequest: UploadFileRequest): Promise<S3UploadResult> {
    console.log(`${COMPONENT}: Starting S3 file upload`)

    try {
      // Step 1: Validate upload request
      const validatedRequest = await this.validateUploadRequest(uploadRequest)

      const { file, userId } = validatedRequest

      // Step 2: Initialize S3 storage
      const storage = this.initializeStorage()

      // Step 3: Upload to S3 storage
      const s3Result = await this.uploadToFileStorage(storage, file, userId)

      console.log(`${COMPONENT}: S3 file upload completed successfully`)
      
      return s3Result

    } catch (error) {
      console.error(`${COMPONENT}: S3 file upload failed:`, error)
      throw error
    }
  }

  /**
   * Initialize S3 storage
   * Following hiring-force storage initialization patterns
   */
  static initializeStorage(): S3Infrastructure {
    const storage = new S3Infrastructure()

    if (!storage) {
      throw new Error('Failed to initialize storage mechanism')
    }

    return storage
  }

  /**
   * Upload to file storage
   * Following hiring-force S3 upload patterns
   */
  static async uploadToFileStorage(
    storage: S3Infrastructure,
    file: Express.Multer.File,
    userId: string
  ): Promise<S3UploadResult> {
    
    try {
      console.log(`${COMPONENT}: Uploading file to S3 for user: ${userId}`)
      
      const result = await storage.uploadFile(file, userId)
      
      console.log(`${COMPONENT}: S3 upload successful, key: ${result.key}`)
      
      return result

    } catch (error) {
      console.error(`${COMPONENT}: S3 upload failed:`, error)
      throw error
    }
  }

  /**
   * Validate upload request
   * Following hiring-force validation patterns
   */
  static async validateUploadRequest(request: UploadFileRequest): Promise<UploadFileRequest> {
    if (!request || !request.file || !request.file.buffer) {
      throw new Error('Invalid upload request or missing file data')
    }

    if (!request.userId) {
      throw new Error('User ID is required for file upload')
    }

    if (!request.file.mimetype.includes('pdf')) {
      throw new Error('Only PDF files are allowed')
    }

    if (request.file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit')
    }

    return request
  }

  /**
   * Generate presigned URL for file access
   * Following hiring-force presigned URL patterns
   */
  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      console.log(`${COMPONENT}: Getting presigned URL for key: ${key}`)
      
      const storage = this.initializeStorage()
      const url = await storage.getPresignedUrl(key, expiresIn)
      
      console.log(`${COMPONENT}: Presigned URL generated successfully`)
      
      return url

    } catch (error) {
      console.error(`${COMPONENT}: Presigned URL generation failed:`, error)
      throw error
    }
  }

  /**
   * Delete file from S3 storage
   * Following hiring-force delete patterns
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      console.log(`${COMPONENT}: Deleting file with key: ${key}`)
      
      const storage = this.initializeStorage()
      await storage.deleteFile(key)
      
      console.log(`${COMPONENT}: File deleted successfully`)

    } catch (error) {
      console.error(`${COMPONENT}: File deletion failed:`, error)
      throw error
    }
  }
}