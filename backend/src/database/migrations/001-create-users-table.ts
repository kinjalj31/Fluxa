import { Database } from '../Database'

export const up = async () => {
  const db = Database.getInstance()
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)
  
  console.log('✅ Created users table')
}

export const down = async () => {
  const db = Database.getInstance()
  await db.query('DROP TABLE IF EXISTS users')
  console.log('❌ Dropped users table')
}