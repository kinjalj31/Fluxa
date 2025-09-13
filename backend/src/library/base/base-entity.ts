import { Database } from '../../database/Database'

/**
 * Base class for all entities
 * Provides common database operations
 */
export abstract class BaseEntity {
  protected db: Database
  protected tableName: string

  constructor(tableName: string) {
    this.db = Database.getInstance()
    this.tableName = tableName
  }

  async findById(id: string): Promise<any> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rows[0] || null
  }

  async findAll(): Promise<any[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
    const result = await this.db.query(query)
    return result.rows
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rowCount > 0
  }

  async exists(field: string, value: any): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.tableName} WHERE ${field} = $1`
    const result = await this.db.query(query, [value])
    return result.rows.length > 0
  }
}