import { Database } from '../Database'

export const up = async () => {
  const db = Database.getInstance()
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'uploaded',
      uploaded_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_uploaded_at ON invoices(uploaded_at);
  `)
  
  console.log('✅ Created invoices table with indexes')
}

export const down = async () => {
  const db = Database.getInstance()
  await db.query('DROP TABLE IF EXISTS invoices')
  console.log('❌ Dropped invoices table')
}