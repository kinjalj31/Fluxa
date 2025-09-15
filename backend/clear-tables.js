const { Client } = require('pg')
require('dotenv').config()

async function clearTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })
  
  await client.connect()
  
  try {
    console.log('🗑️ Clearing tables...')
    
    // Clear in order due to foreign key constraints
    await client.query('DELETE FROM invoice_extracts')
    console.log('✅ Cleared invoice_extracts table')
    
    await client.query('DELETE FROM invoices')
    console.log('✅ Cleared invoices table')
    
    await client.query('DELETE FROM users')
    console.log('✅ Cleared users table')
    
    console.log('🎉 All tables cleared successfully')
    
  } catch (error) {
    console.error('❌ Error clearing tables:', error)
  } finally {
    await client.end()
    process.exit(0)
  }
}

clearTables()