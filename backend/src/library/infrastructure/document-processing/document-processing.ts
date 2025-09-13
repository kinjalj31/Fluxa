import { OCRInfrastructure, OCRResult, GermanInvoiceMetadata } from '../ocr/ocr'
import { InvoiceRepository } from '../../repository'
import { S3Infrastructure } from '../s3/s3'

export type ProcessingStatus = 'uploaded' | 'processing' | 'processed' | 'failed'

export class DocumentProcessingInfrastructure {
  private ocrInfrastructure: OCRInfrastructure
  private invoiceRepository: InvoiceRepository
  private s3Infrastructure: S3Infrastructure

  constructor() {
    this.ocrInfrastructure = new OCRInfrastructure()
    this.invoiceRepository = new InvoiceRepository()
    this.s3Infrastructure = new S3Infrastructure()
  }

  async processDocument(invoiceId: string): Promise<void> {
    try {
      await this.updateDocumentStatus(invoiceId, 'processing')

      const invoice = await this.invoiceRepository.findById(invoiceId)
      if (!invoice) {
        throw new Error('Invoice not found')
      }

      // Get file from S3
      const fileUrl = await this.s3Infrastructure.getPresignedUrl(invoice.file_path)
      
      // Simulate file download and OCR processing
      const fileBuffer = Buffer.from('dummy file content')
      const ocrResult = await this.ocrInfrastructure.simulateOCR(fileBuffer)
      
      // Extract metadata
      const metadata = this.ocrInfrastructure.extractGermanInvoiceMetadata(ocrResult.text)
      
      // Update invoice with results
      await this.updateInvoiceWithResults(invoiceId, ocrResult, metadata)
      
      console.log(`✅ Document processing completed for invoice ${invoiceId}`)
    } catch (error) {
      console.error(`❌ Document processing failed for invoice ${invoiceId}:`, error)
      await this.updateDocumentStatus(invoiceId, 'failed')
      throw error
    }
  }

  private async updateDocumentStatus(invoiceId: string, status: ProcessingStatus): Promise<void> {
    await this.invoiceRepository.updateStatus(invoiceId, status)
  }

  private async updateInvoiceWithResults(
    invoiceId: string, 
    ocrResult: OCRResult, 
    metadata: GermanInvoiceMetadata
  ): Promise<void> {
    await this.invoiceRepository.updateProcessingResults(
      invoiceId,
      ocrResult.text,
      ocrResult.confidence,
      ocrResult.language,
      metadata
    )
  }

  async getDocumentStatus(invoiceId: string): Promise<{ status: ProcessingStatus; metadata?: any }> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new Error('Document not found')
    }

    return {
      status: invoice.status as ProcessingStatus,
      metadata: invoice.extracted_metadata
    }
  }
}