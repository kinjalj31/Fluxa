/**
 * Invoice API Layer
 * 
 * Purpose:
 * - Handles HTTP requests for invoice operations
 * - Validates request data and files
 * - Routes requests to appropriate workflow methods
 * - Returns standardized API responses
 * 
 * Endpoints:
 * - POST /upload: Upload PDF invoice files with user data
 * - GET /: Retrieve all invoices from the system
 */
import { Router, Request, Response } from 'express'
import { InvoiceWorkflows } from '../../workflows/invoice-workflows'
import { upload } from '../../config/multer'

const router = Router()

/**
 * POST /api/invoices/upload
 * 
 * Purpose: Upload PDF invoice file and create invoice record
 * 
 * What it does:
 * - Accepts multipart form data with PDF file
 * - Validates file presence and required fields (userName, email)
 * - Creates or finds user by email
 * - Uploads file to S3 storage
 * - Creates invoice record in database
 * - Starts background OCR processing
 * 
 * Required fields: userName, email, invoice file
 * Returns: Invoice upload confirmation with user and invoice data
 */
router.post(
  '/upload',
  upload.single('invoice'),
  async (request: Request, response: Response) => {
    try {
      if (!request.file) {
        return response.status(400).json({
          message: 'No file uploaded'
        })
      }

      if (!request.body.userName || !request.body.email) {
        return response.status(400).json({
          message: 'Missing required fields: userName and email'
        })
      }

      const result = await InvoiceWorkflows.uploadInvoice({
        userName: request.body.userName,
        email: request.body.email,
        file: request.file
      })
      
      return response.status(201).json(result)
    } catch (error: any) {
      console.error('Upload error:', error)
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

/**
 * GET /api/invoices
 * 
 * Purpose: Retrieve all invoices from the system
 * 
 * What it does:
 * - Fetches all invoice records from database
 * - Returns invoice list with processing status
 * - Includes OCR results and metadata if processed
 * 
 * Returns: List of all invoices with their current status
 */
router.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const result = await InvoiceWorkflows.getAllInvoices()
      
      return response.status(200).json(result)
    } catch (error: any) {
      console.error('Get all invoices error:', error)
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
)

module.exports = router