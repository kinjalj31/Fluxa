import { OCRService, OCRResult, InvoiceMetadata } from './ocrService';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { S3Service } from './s3Service';

export type ProcessingStatus = 'uploaded' | 'processing' | 'processed' | 'validated' | 'failed';

export class DocumentProcessingService {
  private ocrService: OCRService;
  private invoiceRepository: InvoiceRepository;
  private s3Service: S3Service;

  constructor() {
    this.ocrService = new OCRService();
    this.invoiceRepository = new InvoiceRepository();
    this.s3Service = new S3Service();
  }

  async processDocument(invoiceId: string): Promise<void> {
    console.log(`\n=== PROCESSING DOCUMENT ${invoiceId} ===`);
    
    try {
      // Update status to processing
      await this.updateDocumentStatus(invoiceId, 'processing');

      // Get invoice from database
      const invoice = await this.invoiceRepository.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      console.log('Downloading file from S3...');
      // Get file from S3 (simulate with buffer)
      const fileBuffer = Buffer.from('dummy file content'); // In real app, download from S3

      console.log('Running OCR...');
      // Run OCR
      const ocrResult: OCRResult = await this.ocrService.simulateOCR(fileBuffer);
      
      console.log('OCR Result:', ocrResult);

      // Extract metadata
      const metadata: InvoiceMetadata = this.ocrService.extractInvoiceMetadata(ocrResult.text);
      console.log('Extracted Metadata:', metadata);

      // Validate metadata
      const validation = this.ocrService.validateInvoiceMetadata(metadata);
      console.log('Validation:', validation);

      // Update invoice with OCR results and metadata
      await this.updateInvoiceWithResults(invoiceId, ocrResult, metadata);

      // Set final status based on validation
      const finalStatus: ProcessingStatus = validation.isValid ? 'validated' : 'processed';
      await this.updateDocumentStatus(invoiceId, finalStatus);

      console.log(`Document ${invoiceId} processed successfully with status: ${finalStatus}`);
      console.log('=====================================\n');

    } catch (error) {
      console.error(`Processing failed for document ${invoiceId}:`, error);
      await this.updateDocumentStatus(invoiceId, 'failed');
      throw error;
    }
  }

  private async updateDocumentStatus(invoiceId: string, status: ProcessingStatus): Promise<void> {
    await this.invoiceRepository.updateStatus(invoiceId, status);
  }

  private async updateInvoiceWithResults(
    invoiceId: string, 
    ocrResult: OCRResult, 
    metadata: InvoiceMetadata
  ): Promise<void> {
    await this.invoiceRepository.updateProcessingResults(
      invoiceId,
      ocrResult.text,
      ocrResult.confidence,
      ocrResult.language,
      metadata
    );
  }

  async getDocumentStatus(invoiceId: string): Promise<{ status: ProcessingStatus; metadata?: any }> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Document not found');
    }

    return {
      status: invoice.status as ProcessingStatus,
      metadata: invoice.extracted_metadata
    };
  }
}