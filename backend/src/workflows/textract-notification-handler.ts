import { TextractWorkflows } from './textract-workflows'

const COMPONENT = 'TextractNotificationHandler'

export interface TextractNotification {
  JobId: string
  Status: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS'
  API: string
  JobTag?: string
  Timestamp: string
  DocumentLocation: {
    S3ObjectName: string
    S3Bucket: string
  }
}

/**
 * Handles Textract completion notifications from SNS/SQS
 * Processes results when Textract job completes
 */
export class TextractNotificationHandler {
  
  /**
   * Process Textract completion notification
   * Called by SQS message handler when Textract job completes
   */
  static async handleNotification(notification: TextractNotification): Promise<void> {
    console.log(`\n=== ${COMPONENT}: SNS NOTIFICATION RECEIVED ===`)
    console.log(`JobId: ${notification.JobId}`)
    console.log(`Status: ${notification.Status}`)
    console.log(`API: ${notification.API}`)
    console.log(`Timestamp: ${notification.Timestamp}`)
    console.log(`Document: s3://${notification.DocumentLocation.S3Bucket}/${notification.DocumentLocation.S3ObjectName}`)
    console.log(`===============================================\n`)
    
    try {
      if (notification.Status === 'SUCCEEDED') {
        console.log(`${COMPONENT}: Processing SUCCEEDED notification for JobId: ${notification.JobId}`)
        
        // Find invoice by JobId
        const invoiceId = await TextractNotificationHandler.findInvoiceByJobId(notification.JobId)
        
        if (!invoiceId) {
          console.error(`${COMPONENT}: ❌ No invoice found for JobId: ${notification.JobId}`)
          return
        }
        
        console.log(`${COMPONENT}: ✅ Found invoice: ${invoiceId} for JobId: ${notification.JobId}`)
        
        // Process the completed job
        console.log(`${COMPONENT}: 🔄 Starting OCR result processing...`)
        await TextractWorkflows.getOCRResults(notification.JobId, invoiceId)
        
        console.log(`${COMPONENT}: ✅ Successfully processed Textract results for invoice: ${invoiceId}`)
        
      } else if (notification.Status === 'FAILED') {
        console.error(`${COMPONENT}: ❌ Processing FAILED notification for JobId: ${notification.JobId}`)
        
        // Handle failed job
        const invoiceId = await TextractNotificationHandler.findInvoiceByJobId(notification.JobId)
        
        if (invoiceId) {
          console.log(`${COMPONENT}: 🔄 Updating invoice status to failed for: ${invoiceId}`)
          const { InvoiceRepository } = await import('../library/invoice/repository')
          const invoiceRepository = new InvoiceRepository()
          await invoiceRepository.updateStatus(invoiceId, 'failed')
          console.log(`${COMPONENT}: ✅ Invoice status updated to failed`)
        } else {
          console.error(`${COMPONENT}: ❌ No invoice found for failed JobId: ${notification.JobId}`)
        }
        
      } else if (notification.Status === 'IN_PROGRESS') {
        console.log(`${COMPONENT}: ⏳ Textract job still in progress: ${notification.JobId}`)
      } else {
        console.warn(`${COMPONENT}: ⚠️ Unknown notification status: ${notification.Status} for JobId: ${notification.JobId}`)
      }
      
    } catch (error) {
      console.error(`${COMPONENT}: ❌ Error processing notification for JobId: ${notification.JobId}:`, error)
      throw error
    }
  }
  
  /**
   * Find invoice ID by Textract JobId with security validation
   */
  private static async findInvoiceByJobId(jobId: string): Promise<string | null> {
    console.log(`${COMPONENT}: 🔍 Looking up invoice for JobId: ${jobId}`)
    
    try {
      const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
      const extractRepository = new InvoiceExtractRepository()
      
      // Use repository method for security and consistency
      const extract = await extractRepository.findByJobId(jobId)
      
      if (!extract) {
        console.error(`${COMPONENT}: ❌ No extract record found for JobId: ${jobId}`)
        return null
      }
      
      console.log(`${COMPONENT}: 📋 Extract record found:`, {
        id: extract.id,
        invoice_id: extract.invoice_id,
        textract_job_id: extract.textract_job_id,
        processing_status: extract.processing_status
      })
      
      // Validate that both jobId and invoiceId exist for security
      if (!extract.invoice_id || !extract.textract_job_id) {
        console.error(`${COMPONENT}: ❌ Invalid extract record - missing required fields for JobId: ${jobId}`)
        return null
      }
      
      console.log(`${COMPONENT}: ✅ Successfully found invoice: ${extract.invoice_id} for JobId: ${jobId}`)
      return extract.invoice_id
      
    } catch (error) {
      console.error(`${COMPONENT}: ❌ Database error finding invoice by JobId ${jobId}:`, error)
      return null
    }
  }
}