import { Database } from '../../database/Database'
import { InvoiceExtract } from '../../database/models/InvoiceExtract'

export class InvoiceExtractRepository {
  private db = Database.getInstance()
  private tableName = 'invoice_extracts'

  async create(data: Record<string, any>): Promise<InvoiceExtract> {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ')
    const fieldNames = fields.join(', ')

    const query = `
      INSERT INTO ${this.tableName} (${fieldNames}, created_at, updated_at)
      VALUES (${placeholders}, NOW(), NOW())
      RETURNING *
    `
    const result = await this.db.query(query, values)
    return result.rows[0]
  }

  async findByField(field: string, value: any): Promise<InvoiceExtract | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`
    const result = await this.db.query(query, [value])
    return result.rows[0] || null
  }

  async findAll(): Promise<InvoiceExtract[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
    const result = await this.db.query(query)
    return result.rows
  }

  async createExtract(invoiceId: string, extractedData: Partial<InvoiceExtract>): Promise<InvoiceExtract> {
    const data = {
      invoice_id: invoiceId,
      ...extractedData
    }
    return await this.create(data)
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceExtract | null> {
    return await this.findByField('invoice_id', invoiceId)
  }

  async findByJobId(jobId: string): Promise<InvoiceExtract | null> {
    return await this.findByField('textract_job_id', jobId)
  }

  async updateByJobId(jobId: string, invoiceId: string, extractedData: Partial<InvoiceExtract>): Promise<InvoiceExtract> {
    const fields = Object.keys(extractedData)
    const values = Object.values(extractedData)
    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ')

    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE textract_job_id = $1 AND invoice_id = $2
      RETURNING *
    `
    const result = await this.db.query(query, [jobId, invoiceId, ...values])
    return result.rows[0]
  }

  async getValidationReport(): Promise<any[]> {
    const query = `
      SELECT 
        ie.*,
        i.file_name,
        CASE 
          WHEN ie.invoice_number IS NULL THEN 'Missing Invoice Number'
          WHEN ie.sender_address IS NULL THEN 'Missing Sender Address'
          WHEN ie.receiver_address IS NULL THEN 'Missing Receiver Address'
          WHEN ie.total_gross IS NULL THEN 'Missing Total Amount'
          WHEN ie.total_gross < 0 THEN 'Negative Amount'
          WHEN ie.quantity IS NULL OR ie.quantity <= 0 THEN 'Invalid Quantity'
          WHEN ie.unit_price IS NULL OR ie.unit_price <= 0 THEN 'Invalid Unit Price'
          ELSE 'Valid'
        END as validation_status
      FROM invoice_extracts ie
      JOIN invoices i ON ie.invoice_id = i.id
      ORDER BY ie.created_at DESC
    `
    
    const result = await this.db.query(query)
    return result.rows
  }

  async getMissingFieldsReport(): Promise<any[]> {
    const query = `
      SELECT 
        invoice_id,
        file_name,
        ARRAY_REMOVE(ARRAY[
          CASE WHEN invoice_number IS NULL THEN 'invoice_number' END,
          CASE WHEN sender_address IS NULL THEN 'sender_address' END,
          CASE WHEN receiver_address IS NULL THEN 'receiver_address' END,
          CASE WHEN product IS NULL THEN 'product' END,
          CASE WHEN quantity IS NULL THEN 'quantity' END,
          CASE WHEN unit_price IS NULL THEN 'unit_price' END,
          CASE WHEN subtotal IS NULL THEN 'subtotal' END,
          CASE WHEN vat_amount IS NULL THEN 'vat_amount' END,
          CASE WHEN total_gross IS NULL THEN 'total_gross' END,
          CASE WHEN bank_iban IS NULL THEN 'bank_iban' END,
          CASE WHEN bank_bic IS NULL THEN 'bank_bic' END,
          CASE WHEN bank_name IS NULL THEN 'bank_name' END
        ], NULL) as missing_fields
      FROM invoice_extracts ie
      JOIN invoices i ON ie.invoice_id = i.id
      WHERE NOT (
        invoice_number IS NOT NULL AND
        sender_address IS NOT NULL AND
        receiver_address IS NOT NULL AND
        total_gross IS NOT NULL
      )
    `
    
    const result = await this.db.query(query)
    return result.rows
  }
}