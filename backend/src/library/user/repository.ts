import { Database } from '../../database/Database'
import { User } from '../../database/models'

export class UserRepository {
  private db = Database.getInstance()
  private tableName = 'users'

  async create(data: Record<string, any>): Promise<User> {
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

  async findById(id: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rows[0] || null
  }

  async findByField(field: string, value: any): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`
    const result = await this.db.query(query, [value])
    return result.rows[0] || null
  }

  async findAll(): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
    const result = await this.db.query(query)
    return result.rows
  }

  async update(id: string, data: Record<string, any>): Promise<User> {
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

  async count(): Promise<number> {
    const query = `SELECT COUNT(*) FROM ${this.tableName}`
    const result = await this.db.query(query)
    return parseInt(result.rows[0].count)
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findByField('email', email)
  }

  async createUser(name: string, email: string): Promise<User> {
    return await this.create({ name, email })
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.update(id, data)
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`
    const result = await this.db.query(query, [id])
    return result.rowCount > 0
  }

  async getUserStats(): Promise<{ totalUsers: number; recentUsers: number }> {
    const totalUsers = await this.count()
    
    const recentQuery = `
      SELECT COUNT(*) FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `
    const recentResult = await this.db.query(recentQuery)
    const recentUsers = parseInt(recentResult.rows[0].count)

    return { totalUsers, recentUsers }
  }
}