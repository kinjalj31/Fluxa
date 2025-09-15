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
  created_at: Date
  updated_at: Date
}

export class InvoiceModel {
  private repository = new InvoiceRepository()

  async create(userId: string, fileName: string, filePath: string, fileSize: number, mimeType: string): Promise<Invoice> {
    return this.repository.createInvoice(userId, fileName, filePath, fileSize, mimeType)
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.repository.findById(id)
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return this.repository.findByUserId(userId)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.updateStatus(id, status)
  }

  async findAll(): Promise<Invoice[]> {
    return this.repository.findAll()
  }
}