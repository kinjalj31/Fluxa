import axios from 'axios'
import { Invoice, UploadInvoiceRequest, ApiResponse } from '@/shared/types/invoice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const invoiceApi = {
  upload: async (data: UploadInvoiceRequest): Promise<ApiResponse<{ invoice: Invoice }>> => {
    const formData = new FormData()
    formData.append('userName', data.userName)
    formData.append('email', data.email)
    formData.append('invoice', data.file)

    const response = await api.post('/api/invoices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getByEmail: async (email: string): Promise<ApiResponse<{ invoices: Invoice[] }>> => {
    const response = await api.get(`/api/invoices/${email}`)
    return response.data
  },

  getStatus: async (id: string): Promise<ApiResponse<{ status: string; metadata?: any }>> => {
    const response = await api.get(`/api/invoices/status/${id}`)
    return response.data
  }
}

export default api