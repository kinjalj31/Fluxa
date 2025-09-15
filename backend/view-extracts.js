const { Client } = require('pg')
require('dotenv').config()

async function viewExtracts() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })
  
  await client.connect()
  
  try {
    console.log('📋 Invoice Extracts Table:\n')
    
    const result = await client.query('SELECT * FROM invoice_extracts ORDER BY created_at DESC')
    
    if (result.rows.length === 0) {
      console.log('No records found in invoice_extracts table')
      return
    }
    
    result.rows.forEach((row, index) => {
      console.log(`--- Record ${index + 1} ---`)
      console.log(`ID: ${row.id}`)
      console.log(`Invoice ID: ${row.invoice_id}`)
      console.log(`Invoice Number: ${row.invoice_number}`)
      console.log(`Total Gross: ${row.total_gross}`)
      console.log(`Bank IBAN: ${row.bank_iban}`)
      console.log(`Processing Status: ${row.processing_status}`)
      console.log(`Textract Job ID: ${row.textract_job_id}`)
      console.log(`Created: ${row.created_at}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

viewExtracts()