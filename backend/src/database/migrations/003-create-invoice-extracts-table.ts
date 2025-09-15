import { Database } from '../Database'

export const up = async () => {
  const db = Database.getInstance()
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoice_extracts (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      invoice_number VARCHAR(100),
      sender_address TEXT,
      receiver_address TEXT,
      product TEXT,
      quantity DECIMAL(10,2),
      unit_price DECIMAL(10,2),
      subtotal DECIMAL(10,2),
      vat_rate DECIMAL(5,2) DEFAULT 19.00,
      vat_amount DECIMAL(10,2),
      total_gross DECIMAL(10,2),
      bank_iban VARCHAR(34),
      bank_bic VARCHAR(11),
      bank_name VARCHAR(255),
      extraction_confidence DECIMAL(3,2),
      textract_job_id VARCHAR(100),
      processing_status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_extracts_invoice_id ON invoice_extracts(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_extracts_invoice_number ON invoice_extracts(invoice_number);
  `)
  
  console.log('✅ Created invoice_extracts table with indexes')
}

export const down = async () => {
  const db = Database.getInstance()
  await db.query('DROP TABLE IF EXISTS invoice_extracts')
  console.log('❌ Dropped invoice_extracts table')
}