import { useState, useEffect } from 'react'
import { Invoice } from '@/shared/types/invoice'
import { invoiceApi } from '@/shared/services/api'

export const useInvoices = (email: string, refreshTrigger: number = 0) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async () => {
    if (!email) {
      setInvoices([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await invoiceApi.getByEmail(email)
      setInvoices(response.data.invoices || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [email, refreshTrigger])

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices
  }
}

export const useInvoiceUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadInvoice = async (data: { userName: string; email: string; file: File }) => {
    setUploading(true)
    setError(null)

    try {
      const response = await invoiceApi.upload(data)
      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadInvoice,
    uploading,
    error,
    clearError: () => setError(null)
  }
}