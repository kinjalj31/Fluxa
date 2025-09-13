import { Database } from './Database'
import { runMigrations } from './migrations'

export class DatabaseService {
  private static instance: DatabaseService
  private db: Database

  private constructor() {
    this.db = Database.getInstance()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing database...')
      
      // Initialize database connection
      await this.db.init()
      
      // Run migrations
      await runMigrations()
      
      console.log('✅ Database initialized successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.db.query('SELECT 1')
      return {
        status: 'healthy',
        timestamp: new Date()
      }
    } catch (error) {
      throw new Error('Database health check failed')
    }
  }

  async close(): Promise<void> {
    await this.db.close()
  }
}