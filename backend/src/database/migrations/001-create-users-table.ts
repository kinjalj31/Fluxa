import { Database } from '../Database'

export const up = async (): Promise<void> => {
  const db = Database.getInstance()
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
  
  console.log('✅ Created users table')
}

export const down = async (): Promise<void> => {
  const db = Database.getInstance()
  
  await db.query('DROP TABLE IF EXISTS users')
  
  console.log('❌ Dropped users table')
}