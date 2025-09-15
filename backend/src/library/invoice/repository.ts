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
}