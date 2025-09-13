import { BaseRepository } from '../base/base-repository'
import { Invoice } from '../../database/models'

/**
 * Invoice repository
 * Handles all invoice-related database operations
 */
export class InvoiceRepository extends BaseRepository {
  constructor() {
    super('invoices')
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return await this.findAll({ user_id: userId })
  }

  async createInvoice(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string
  ): Promise<Invoice> {
    return await this.create({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType,
      status: 'uploaded'
    })
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.update(id, { status })
  }

  async updateProcessingResults(
    id: string,
    ocrText: string,
    confidence: number,
    language: string,
    metadata: any
  ): Promise<void> {
    await this.update(id, {
      ocr_text: ocrText,
      ocr_confidence: confidence,
      ocr_language: language,
      extracted_metadata: JSON.stringify(metadata),
      processed_at: new Date(),
      status: 'processed'
    })
  }

  async getInvoiceStats(): Promise<{
    totalInvoices: number
    processedInvoices: number
    pendingInvoices: number
  }> {
    const totalInvoices = await this.count()
    const processedInvoices = await this.count({ status: 'processed' })
    const pendingInvoices = await this.count({ status: 'uploaded' })

    return { totalInvoices, processedInvoices, pendingInvoices }
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return await this.findAll({ status })
  }
}