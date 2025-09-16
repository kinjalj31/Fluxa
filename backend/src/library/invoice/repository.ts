import { Database } from '../../database/Database'
import { Invoice } from '../../database/models/Invoice'

export class InvoiceRepository {
  private db = Database.getInstance()
  private tableName = 'invoices'

  async create(data: Record<string, any>): Promise<Invoice> {
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

  async findById(id: string): Promise<Invoice | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rows[0] || null
  }

  async findAll(conditions: Record<string, any> = {}): Promise<Invoice[]> {
    let query = `SELECT * FROM ${this.tableName}`
    const values: any[] = []

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ')
      query += ` WHERE ${whereClause}`
      values.push(...Object.values(conditions))
    }

    query += ` ORDER BY created_at DESC`
    const result = await this.db.query(query, values)
    return result.rows
  }

  async update(id: string, data: Record<string, any>): Promise<Invoice> {
    const fields = Object.keys(data).filter(key => key !== 'id')
    const values = fields.map(field => data[field])
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `
    const result = await this.db.query(query, [id, ...values])
    return result.rows[0]
  }

  async createInvoice(userId: string, fileName: string, filePath: string, fileSize: number, mimeType: string): Promise<Invoice> {
    const invoiceData = {
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType,
      status: 'uploaded',
      uploaded_at: new Date()
    }
    return await this.create(invoiceData)
  }

  async updateStatus(invoiceId: string, status: string): Promise<Invoice> {
    return await this.update(invoiceId, { status })
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return await this.findAll({ status })
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return await this.findAll({ user_id: userId })
  }

  async findAllWithExtracts(): Promise<any[]> {
    const query = `
      SELECT 
        i.*,
        e.id as extract_id,
        e.invoice_number,
        e.sender_address,
        e.receiver_address,
        e.product,
        e.quantity,
        e.unit_price,
        e.subtotal,
        e.vat_rate,
        e.vat_amount,
        e.total_gross,
        e.bank_iban,
        e.bank_bic,
        e.bank_name,
        e.extraction_confidence,
        e.textract_job_id,
        e.processing_status,
        e.created_at as extract_created_at,
        e.updated_at as extract_updated_at
      FROM ${this.tableName} i
      LEFT JOIN invoice_extracts e ON i.id = e.invoice_id
      ORDER BY i.created_at DESC
    `
    
    const result = await this.db.query(query)
    
    return result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      mime_type: row.mime_type,
      status: row.status,
      uploaded_at: row.uploaded_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      extract: row.extract_id ? {
        id: row.extract_id,
        invoice_id: row.id,
        invoice_number: row.invoice_number,
        sender_address: row.sender_address,
        receiver_address: row.receiver_address,
        product: row.product,
        quantity: row.quantity,
        unit_price: row.unit_price,
        subtotal: row.subtotal,
        vat_rate: row.vat_rate,
        vat_amount: row.vat_amount,
        total_gross: row.total_gross,
        bank_iban: row.bank_iban,
        bank_bic: row.bank_bic,
        bank_name: row.bank_name,
        extraction_confidence: row.extraction_confidence,
        textract_job_id: row.textract_job_id,
        processing_status: row.processing_status,
        created_at: row.extract_created_at,
        updated_at: row.extract_updated_at
      } : null
    }))
  }
}