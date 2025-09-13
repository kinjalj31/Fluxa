import { InvoiceRepository } from '../library/repository'
import { DocumentProcessingInfrastructure } from '../library/infrastructure'
import { FilesStorageWorkflows, S3UploadResult } from './files-storage-workflows'
import { UserWorkflows } from './user-workflows'

const COMPONENT = 'InvoiceWorkflows'

export interface UploadInvoiceRequest {
  userName: string
  email: string
  file: Express.Multer.File
}

/**
 * Invoice Workflows
 * Business logic layer for invoice operations following hiring-force patterns
 */
export class InvoiceWorkflows {

  /**
   * Upload Invoice Workflow
   * 
   * Complete Flow:
   * 1. Find or create user by email
   * 2. Upload file to S3 storage (using FilesStorageWorkflows)
   * 3. Save invoice record in database with S3 metadata (using Repository)
   * 4. Start background OCR processing
   * 5. Return structured response with user and invoice data
   */
  static async uploadInvoice(data: UploadInvoiceRequest) {
    console.log(`${COMPONENT}: Starting invoice upload workflow`)
    console.log(`Email: ${data.email}, File: ${data.file.originalname}`)

    try {
      // Step 1: Find or create user
      console.log(`${COMPONENT}: Step 1 - Finding or creating user`)
      const user = await UserWorkflows.findOrCreateUser(data.userName, data.email)

      // Step 2: Upload file to S3 storage
      console.log(`${COMPONENT}: Step 2 - Uploading file to S3`)
      const s3Result: S3UploadResult = await FilesStorageWorkflows.upload({
        file: data.file,
        userId: user.id
      })

      // Step 3: Save invoice record in database with S3 metadata
      console.log(`${COMPONENT}: Step 3 - Saving invoice record to database`)
      const invoice = await this.saveInvoiceToDatabase(user.id, data.file, s3Result)

      // Step 4: Start background OCR processing (non-blocking)
      // console.log(`${COMPONENT}: Step 4 - Starting background processing`)
      // this.startBackgroundProcessing(invoice.id)

      console.log(`${COMPONENT}: Invoice upload workflow completed successfully`)

      return {
        success: true,
        message: 'Invoice uploaded successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          invoice: {
            id: invoice.id,
            file_name: invoice.file_name,
            file_path: invoice.file_path,
            file_size: invoice.file_size,
            mime_type: invoice.mime_type,
            status: invoice.status,
            uploaded_at: invoice.uploaded_at,
            s3_url: s3Result.url
          }
        }
      }

    } catch (error) {
      console.error(`${COMPONENT}: Upload workflow failed:`, error)
      throw error
    }
  }

  /**
   * Get All Invoices Workflow
   * 
   * Business Logic:
   * - Retrieve all invoices from database using repository
   * - Include processing status and metadata
   * - Return formatted response
   */
  static async getAllInvoices() {
    console.log(`${COMPONENT}: Getting all invoices`)

    try {
      const invoiceRepository = new InvoiceRepository()
      const invoices = await invoiceRepository.findAll()

      console.log(`${COMPONENT}: Found ${invoices.length} invoices`)

      return {
        success: true,
        message: 'All invoices retrieved successfully',
        data: {
          invoices: invoices.map(invoice => ({
            id: invoice.id,
            file_name: invoice.file_name,
            file_size: invoice.file_size,
            mime_type: invoice.mime_type,
            status: invoice.status,
            uploaded_at: invoice.uploaded_at,
            processed_at: invoice.processed_at,
            ocr_text: invoice.ocr_text,
            ocr_confidence: invoice.ocr_confidence,
            ocr_language: invoice.ocr_language,
            extracted_metadata: invoice.extracted_metadata
          }))
        }
      }

    } catch (error) {
      console.error(`${COMPONENT}: Get all invoices failed:`, error)
      throw error
    }
  }

  /**
   * Save invoice to database using repository
   * Following hiring-force database save patterns
   */
  private static async saveInvoiceToDatabase(
    userId: string,
    file: Express.Multer.File,
    s3Result: S3UploadResult
  ) {
    try {
      console.log(`${COMPONENT}: Saving invoice record for user: ${userId}`)

      const invoiceRepository = new InvoiceRepository()

      // Create invoice record with S3 metadata
      const invoice = await invoiceRepository.createInvoice(
        userId,
        file.originalname,
        s3Result.key, // S3 key as file_path
        file.size,
        file.mimetype
      )

      console.log(`${COMPONENT}: Invoice record saved with ID: ${invoice.id}`)
      
      return invoice

    } catch (error) {
      console.error(`${COMPONENT}: Database save failed:`, error)
      throw new Error('Failed to save invoice record')
    }
  }

  /**
   * Start background processing
   * Following hiring-force async processing patterns
   */
  private static startBackgroundProcessing(invoiceId: string): void {
    console.log(`${COMPONENT}: Starting background processing for invoice: ${invoiceId}`)
    
    // Non-blocking background processing
    const processingInfrastructure = new DocumentProcessingInfrastructure()
    processingInfrastructure.processDocument(invoiceId).catch(error => {
      console.error(`${COMPONENT}: Background processing failed for invoice ${invoiceId}:`, error)
    })
  }
}