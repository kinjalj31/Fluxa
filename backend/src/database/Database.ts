import { Pool } from 'pg'

/**
 * Database helper class
 * 
 * What it does:
 * - Connects to PostgreSQL database
 * - Runs SQL queries safely
 * - Handles database transactions
 * 
 * Why we need it:
 * - One place to manage all database connections
 * - Prevents too many connections to database
 * - Makes database operations easier and safer
 */
export class Database {
  private static instance: Database
  private pool: Pool

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'appdb',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async init(): Promise<void> {
    console.log('Database initialized')
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}