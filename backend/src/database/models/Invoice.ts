import { InvoiceRepository } from '../../library/invoice/repository'

export interface Invoice {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: string
  uploaded_at: Date
  processed_at?: Date
  ocr_text?: string
  ocr_confidence?: number
  ocr_language?: string
  extracted_metadata?: any
  created_at: Date
  updated_at: Date
}

export class InvoiceModel {
  private repository: InvoiceRepository

  constructor() {
    this.repository = new InvoiceRepository()
  }

  async create(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string
  ): Promise<Invoice> {
    return await this.repository.createInvoice(userId, fileName, filePath, fileSize, mimeType)
  }

  async findById(id: string): Promise<Invoice | null> {
    return await this.repository.findById(id)
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return await this.repository.findByUserId(userId)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.updateStatus(id, status)
  }

  async updateProcessingResults(
    id: string,
    ocrText: string,
    confidence: number,
    language: string,
    metadata: any
  ): Promise<void> {
    await this.repository.updateProcessingResults(id, ocrText, confidence, language, metadata)
  }

  async findAll(): Promise<Invoice[]> {
    return await this.repository.findAll()
  }
}