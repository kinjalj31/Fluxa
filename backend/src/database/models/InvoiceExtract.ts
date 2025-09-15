import { InvoiceExtractRepository } from '../../library/invoice/invoice-extracts'

export interface InvoiceExtract {
  id: string
  invoice_id: string
  invoice_number?: string
  sender_address?: string
  receiver_address?: string
  product?: string
  quantity?: number
  unit_price?: number
  subtotal?: number
  vat_rate?: number
  vat_amount?: number
  total_gross?: number
  bank_iban?: string
  bank_bic?: string
  bank_name?: string
  extraction_confidence?: number
  textract_job_id?: string
  processing_status?: string
  created_at: Date
  updated_at: Date
}

export class InvoiceExtractModel {
  private repository = new InvoiceExtractRepository()

  async create(invoiceId: string, extractedData: Partial<InvoiceExtract>): Promise<InvoiceExtract> {
    return this.repository.createExtract(invoiceId, extractedData)
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceExtract | null> {
    return this.repository.findByInvoiceId(invoiceId)
  }

  async getValidationReport(): Promise<any[]> {
    return this.repository.getValidationReport()
  }

  async getMissingFieldsReport(): Promise<any[]> {
    return this.repository.getMissingFieldsReport()
  }

  async findAll(): Promise<InvoiceExtract[]> {
    return this.repository.findAll()
  }
}