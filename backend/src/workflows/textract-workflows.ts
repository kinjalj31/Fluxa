import { TextractClient, StartDocumentAnalysisCommand, GetDocumentAnalysisCommand } from '@aws-sdk/client-textract'
import { InvoiceRepository } from '../library/invoice/repository'


const COMPONENT = 'TextractWorkflows'

export interface TextractResult {
  jobId: string
  status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
  extractedText?: string
  invoiceData?: any
  confidence?: number
}

export interface StartOCRRequest {
  invoiceId: string
  s3Bucket: string
  s3Key: string
}

/**
 * Textract Workflows
 * AWS Textract operations for document OCR processing
 */
export class TextractWorkflows {
  private static client = new TextractClient({
    region: process.env.AWS_REGION || 'us-east-1',
    // Remove LocalStack endpoint for real AWS
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  /**
   * Start OCR Processing
   * 
   * Core function that initiates AWS Textract document analysis for invoice processing.
   * This function performs the following operations:
   * 
   * 1. **Command Construction**: Creates StartDocumentAnalysisCommand with:
   *    - S3 document location (bucket + key)
   *    - Feature extraction types (TABLES, FORMS, LAYOUT)
   *    - Optional SNS notification channel for completion alerts
   * 
   * 2. **AWS Textract Integration**: 
   *    - Sends command to AWS Textract service
   *    - Receives immediate JobId response (processing starts in background)
   *    - Does NOT wait for OCR completion (async operation)
   * 
   * 3. **Database Operations**:
   *    - Updates invoice status to 'processing' in invoices table
   *    - Creates initial record in invoice_extracts table with JobId
   *    - Prepares tracking infrastructure for completion handling
   * 
   * 4. **Notification Setup** (if configured):
   *    - Uses SNS topic ARN for completion notifications
   *    - Requires IAM role with SNS publish permissions
   *    - Enables event-driven processing instead of polling
   * 
   * 5. **Error Handling**:
   *    - Catches AWS service errors (permissions, invalid S3 location)
   *    - Updates invoice status to 'failed' on errors
   *    - Provides detailed error logging for debugging
   * 
   * @param request - Contains invoiceId, s3Bucket, and s3Key for processing
   * @returns Promise<TextractResult> - JobId and IN_PROGRESS status
   * 
   * **Processing Flow**:
   * User Upload → S3 Storage → This Function → AWS Textract (background)
   * ↓
   * Database Update → Return JobId → SNS Notification (when complete)
   * 
   * **Timing**: Function returns in ~1-2 seconds, actual OCR takes 30s-5min
   */
  static async startOCRProcessing(request: StartOCRRequest): Promise<TextractResult> {
    console.log(`\n=== ${COMPONENT}: STARTING OCR PROCESSING ===`)
    console.log(`Invoice ID: ${request.invoiceId}`)
    console.log(`S3 Bucket: ${request.s3Bucket}`)
    console.log(`S3 Key: ${request.s3Key}`)
    console.log(`SNS Topic: ${process.env.TEXTRACT_SNS_TOPIC_ARN}`)
    console.log(`IAM Role: ${process.env.TEXTRACT_ROLE_ARN}`)
    console.log(`SQS Queue: ${process.env.TEXTRACT_SQS_QUEUE_URL}`)
    console.log(`AWS Region: ${process.env.AWS_REGION}`)
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`==============================================\n`)

    // Validate required parameters
    if (!request.s3Bucket || !request.s3Key) {
      throw new Error('Missing required S3 parameters: bucket or key')
    }
    
    if (!process.env.TEXTRACT_SNS_TOPIC_ARN || !process.env.TEXTRACT_ROLE_ARN) {
      throw new Error('Missing required Textract SNS/IAM configuration')
    }

    try {
      const command = new StartDocumentAnalysisCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: request.s3Bucket,
            Name: request.s3Key
          }
        },
        FeatureTypes: ['TABLES', 'FORMS', 'LAYOUT'], // Extract tables, form fields, and document layout
        NotificationChannel: { // SNS notifications always enabled for production
          SNSTopicArn: process.env.TEXTRACT_SNS_TOPIC_ARN!, // SNS topic for completion notifications
          RoleArn: process.env.TEXTRACT_ROLE_ARN! // IAM role for Textract to publish to SNS
        }
      })

      console.log(`${COMPONENT}: 🚀 Sending StartDocumentAnalysis command to AWS Textract...`)
      const response = await this.client.send(command)
      
      console.log(`${COMPONENT}: ✅ Textract job created successfully!`)
      console.log(`${COMPONENT}: JobId: ${response.JobId}`)
      console.log(`${COMPONENT}: Job Status: IN_PROGRESS`)
      
      // Update invoice status to processing and create initial extract record
      console.log(`${COMPONENT}: 📋 Updating database records...`)
      await this.updateInvoiceStatus(request.invoiceId, 'processing')
      await this.createInitialExtractRecord(request.invoiceId, response.JobId!)
      console.log(`${COMPONENT}: ✅ Database records updated successfully`)
      console.log(`${COMPONENT}: 🔔 SNS notifications enabled - completion events will be sent to: ${process.env.TEXTRACT_SNS_TOPIC_ARN}`)
      console.log(`${COMPONENT}: 📨 SQS polling service will automatically process completion notifications`)

      return {
        jobId: response.JobId!,
        status: 'IN_PROGRESS'
      }

    } catch (error) {
      console.error(`${COMPONENT}: ❌ Failed to start OCR processing:`, error)
      console.log(`${COMPONENT}: 🔄 Updating invoice status to failed...`)
      await this.updateInvoiceStatus(request.invoiceId, 'failed')
      throw error
    }
  }

  /**
   * Get OCR Results
   * Retrieves Textract results and updates invoice_extracts table with structured data
   */
  static async getOCRResults(jobId: string, invoiceId: string): Promise<TextractResult> {
    console.log(`\n=== ${COMPONENT}: RETRIEVING OCR RESULTS ===`)
    console.log(`JobId: ${jobId}`)
    console.log(`Invoice ID: ${invoiceId}`)
    console.log(`==========================================\n`)

    try {
      const command = new GetDocumentAnalysisCommand({
        JobId: jobId
      })

      console.log(`${COMPONENT}: 🚀 Sending GetDocumentAnalysis command to AWS Textract...`)
      const response = await this.client.send(command)
      
      console.log(`${COMPONENT}: 📋 Textract Response:`, {
        JobStatus: response.JobStatus,
        BlockCount: response.Blocks?.length || 0,
        DocumentMetadata: response.DocumentMetadata
      })

      if (response.JobStatus === 'SUCCEEDED') {
        console.log(`${COMPONENT}: ✅ Textract job completed successfully!`)
        console.log(`${COMPONENT}: 🔄 Extracting text and structured data...`)
        
        const extractedText = this.extractText(response.Blocks || [])
        const invoiceData = this.extractInvoiceFields(response.Blocks || [])
        
        console.log(`${COMPONENT}: 📋 Extracted Data Summary:`, {
          textLength: extractedText.length,
          invoiceNumber: invoiceData.invoice_number,
          totalGross: invoiceData.total_gross,
          bankIban: invoiceData.bank_iban
        })

        // Update invoice_extracts table with OCR results
        console.log(`${COMPONENT}: 📋 Updating database with extracted data...`)
        const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
        const extractRepository = new InvoiceExtractRepository()
        
        await extractRepository.updateByJobId(jobId, invoiceId, {
          processing_status: 'completed',
          invoice_number: invoiceData.invoice_number ?? undefined,
          sender_address: invoiceData.sender_address ?? undefined,
          receiver_address: invoiceData.receiver_address ?? undefined,
          product: invoiceData.product ?? undefined,
          quantity: invoiceData.quantity ?? undefined,
          unit_price: invoiceData.unit_price ?? undefined,
          subtotal: invoiceData.subtotal ?? undefined,
          vat_rate: invoiceData.vat_rate ?? undefined,
          vat_amount: invoiceData.vat_amount ?? undefined,
          total_gross: invoiceData.total_gross ?? undefined,
          bank_iban: invoiceData.bank_iban ?? undefined,
          bank_bic: invoiceData.bank_bic ?? undefined,
          bank_name: invoiceData.bank_name ?? undefined
        })

        // Update invoice status to completed
        await this.updateInvoiceStatus(invoiceId, 'completed')
        console.log(`${COMPONENT}: ✅ Database updated successfully`)

        console.log(`${COMPONENT}: ✅ OCR processing completed successfully for invoice: ${invoiceId}`)

        return {
          jobId,
          status: 'SUCCEEDED',
          extractedText,
          invoiceData
        }
      } else {
        console.error(`${COMPONENT}: ❌ Textract job failed with status: ${response.JobStatus}`)
        
        // Update extract status for failed jobs
        const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
        const extractRepository = new InvoiceExtractRepository()
        
        await extractRepository.updateByJobId(jobId, invoiceId, {
          processing_status: 'failed'
        })
        
        await this.updateInvoiceStatus(invoiceId, 'failed')
        console.log(`${COMPONENT}: 📋 Database updated with failed status`)
      }

      return {
        jobId,
        status: response.JobStatus as any
      }

    } catch (error) {
      console.error(`${COMPONENT}: ❌ Failed to get OCR results for JobId ${jobId}:`, error)
      
      // Update extract status for errors
      try {
        console.log(`${COMPONENT}: 🔄 Updating database with error status...`)
        const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
        const extractRepository = new InvoiceExtractRepository()
        
        await extractRepository.updateByJobId(jobId, invoiceId, {
          processing_status: 'failed'
        })
        console.log(`${COMPONENT}: ✅ Database updated with failed status`)
      } catch (dbError) {
        console.error(`${COMPONENT}: ❌ Failed to update extract status:`, dbError)
      }
      
      await this.updateInvoiceStatus(invoiceId, 'failed')
      throw error
    }
  }

  /**
   * Process Document End-to-End
   * Initiates OCR processing and returns immediately (async completion via SNS/SQS)
   */
  static async processDocument(invoiceId: string, s3Bucket: string, s3Key: string): Promise<void> {
    console.log(`${COMPONENT}: Processing document end-to-end for invoice: ${invoiceId}`)

    try {
      // Start OCR job and create initial extract record
      await this.startOCRProcessing({
        invoiceId,
        s3Bucket,
        s3Key
      })
      
      console.log(`${COMPONENT}: Document processing initiated successfully`)

    } catch (error) {
      console.error(`${COMPONENT}: Document processing failed:`, error)
            // Update invoice status to failed in database
      try {
        const invoiceRepository = new InvoiceRepository()
        await invoiceRepository.updateStatus(invoiceId, 'failed')
        console.log(`${COMPONENT}: Invoice status updated to failed for: ${invoiceId}`)
      } catch (dbError) {
        console.error(`${COMPONENT}: Failed to update invoice status to failed:`, dbError)
      }
      throw error
    }
  }

  /**
   * Extract plain text from Textract blocks
   */
  private static extractText(blocks: any[]): string {
    return blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n')
  }

  /**
   * Extract structured invoice data from Textract blocks
   */
  private static extractInvoiceFields(blocks: any[]) {
    return {
      invoice_number: this.findFieldValue(blocks, ['invoice', 'number', 'inv', 'rechnung']),
      sender_address: this.findFieldValue(blocks, ['from', 'sender', 'absender', 'company']),
      receiver_address: this.findFieldValue(blocks, ['to', 'receiver', 'empfänger', 'bill to']),
      product: this.findFieldValue(blocks, ['product', 'item', 'description', 'artikel']),
      quantity: this.parseNumber(this.findFieldValue(blocks, ['quantity', 'qty', 'menge', 'anzahl'])),
      unit_price: this.parseNumber(this.findFieldValue(blocks, ['price', 'unit price', 'einzelpreis'])),
      subtotal: this.parseNumber(this.findFieldValue(blocks, ['subtotal', 'netto', 'net'])),
      vat_rate: 19.00, // Default German VAT
      vat_amount: this.parseNumber(this.findFieldValue(blocks, ['vat', 'tax', 'mwst', '19%'])),
      total_gross: this.parseNumber(this.findFieldValue(blocks, ['total', 'gross', 'brutto', 'gesamt'])),
      bank_iban: this.findFieldValue(blocks, ['iban']),
      bank_bic: this.findFieldValue(blocks, ['bic', 'swift']),
      bank_name: this.findFieldValue(blocks, ['bank', 'bankname'])
    }
  }

  /**
   * Find field value by keywords
   */
  private static findFieldValue(blocks: any[], keywords: string[]): string | null {
    for (const block of blocks) {
      if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
        const keyText = block.Text?.toLowerCase() || ''
        
        for (const keyword of keywords) {
          if (keyText.includes(keyword.toLowerCase())) {
            // Find corresponding value block
            const valueBlock = blocks.find(b => 
              b.BlockType === 'KEY_VALUE_SET' && 
              b.EntityTypes?.includes('VALUE') &&
              block.Relationships?.some((rel: any) => 
                rel.Type === 'VALUE' && rel.Ids?.includes(b.Id)
              )
            )
            
            return valueBlock?.Text || null
          }
        }
      }
    }
    return null
  }

  /**
   * Parse number from string, handling German number format
   */
  private static parseNumber(value: string | null): number | null {
    if (!value) return null
    
    // Handle German number format (1.234,56 -> 1234.56)
    const cleaned = value
      .replace(/[^0-9.,]/g, '') // Remove non-numeric chars except . and ,
      .replace(/\./g, '') // Remove thousand separators
      .replace(',', '.') // Replace decimal comma with dot
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }



  /**
   * Save OCR results to database
   */
  private static async saveOCRResults(
    invoiceId: string, 
    extractedText: string, 
    invoiceData: any
  ): Promise<void> {
    try {
      const invoiceRepository = new InvoiceRepository()
      
      // Update invoice status to processed
      await invoiceRepository.updateStatus(invoiceId, 'processed')

      // Save structured data to invoice_extracts table
      await this.saveStructuredData(invoiceId, invoiceData)

      console.log(`${COMPONENT}: OCR results saved for invoice: ${invoiceId}`)

    } catch (error) {
      console.error(`${COMPONENT}: Failed to save OCR results:`, error)
      throw error
    }
  }

  /**
   * Save structured data using repository method
   */
  private static async saveStructuredData(invoiceId: string, invoiceData: any): Promise<void> {
    try {
      const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
      const extractRepository = new InvoiceExtractRepository()
      
      await extractRepository.createExtract(invoiceId, {
        ...invoiceData,
        processing_status: 'completed'
      })

      console.log(`${COMPONENT}: Structured data saved for invoice: ${invoiceId}`)

    } catch (error) {
      console.error(`${COMPONENT}: Failed to save structured data:`, error)
      throw error
    }
  }

  /**
   * Update invoice status
   */
  private static async updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
    try {
      const invoiceRepository = new InvoiceRepository()
      await invoiceRepository.updateStatus(invoiceId, status)
      
      console.log(`${COMPONENT}: Invoice status updated to: ${status}`)

    } catch (error) {
      console.error(`${COMPONENT}: Failed to update invoice status:`, error)
    }
  }



  /**
   * Create initial extract record with JobId using repository method
   */
  private static async createInitialExtractRecord(invoiceId: string, jobId: string): Promise<void> {
    try {
      const { InvoiceExtractRepository } = await import('../library/invoice/invoice-extracts')
      const extractRepository = new InvoiceExtractRepository()
      
      await extractRepository.createExtract(invoiceId, {
        textract_job_id: jobId,
        processing_status: 'processing',
        vat_rate: 19.00
      })

      console.log(`${COMPONENT}: Initial extract record created for invoice: ${invoiceId}`)

    } catch (error) {
      console.error(`${COMPONENT}: Failed to create initial extract record:`, error)
    }
  }
}