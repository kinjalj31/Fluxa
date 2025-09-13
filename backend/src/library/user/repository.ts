import { BaseRepository } from '../base/base-repository'
import { User } from '../../database/models'

/**
 * User repository
 * Handles all user-related database operations
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users')
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
    return await this.delete(id)
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