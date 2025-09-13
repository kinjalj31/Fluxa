import { Database } from '../../database/Database'

/**
 * Base repository class
 * Provides common repository patterns and database operations
 */
export abstract class BaseRepository {
  protected db: Database
  protected tableName: string

  constructor(tableName: string) {
    this.db = Database.getInstance()
    this.tableName = tableName
  }

  async create(data: Record<string, any>): Promise<any> {
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

  async findById(id: string): Promise<any> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rows[0] || null
  }

  async findByField(field: string, value: any): Promise<any> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`
    const result = await this.db.query(query, [value])
    return result.rows[0] || null
  }

  async findAll(conditions: Record<string, any> = {}): Promise<any[]> {
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

  async update(id: string, data: Record<string, any>): Promise<any> {
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

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rowCount > 0
  }

  async count(conditions: Record<string, any> = {}): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName}`
    const values: any[] = []

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(' AND ')
      query += ` WHERE ${whereClause}`
      values.push(...Object.values(conditions))
    }

    const result = await this.db.query(query, values)
    return parseInt(result.rows[0].count)
  }
}