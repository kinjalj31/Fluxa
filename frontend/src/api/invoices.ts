import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export interface InvoiceExtract {
  id: string
  invoice_id: string
  invoice_number: string | null
  sender_address: string | null
  receiver_address: string | null
  product: string | null
  quantity: number | null
  unit_price: number | null
  subtotal: number | null
  vat_rate: number | null
  vat_amount: number | null
  total_gross: number | null
  bank_iban: string | null
  bank_bic: string | null
  bank_name: string | null
  extraction_confidence: number | null
  textract_job_id: string | null
  processing_status: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: 'uploaded' | 'processing' | 'processed' | 'validated' | 'failed' | 'completed'
  uploaded_at: string
  created_at: string
  extract?: InvoiceExtract
}

export interface UploadInvoiceRequest {
  userName: string
  email: string
  file: File
}

export const invoiceApi = {
  upload: async (data: UploadInvoiceRequest) => {
    const formData = new FormData()
    formData.append('userName', data.userName)
    formData.append('email', data.email)
    formData.append('invoice', data.file)

    const response = await api.post('/api/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/api/invoices')
    return response.data
  }
}