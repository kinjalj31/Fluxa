'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Invoice {
  id: string
  file_name: string
  status: string
  uploaded_at: string
  extracted_metadata?: any
}

interface InvoiceListProps {
  refreshTrigger: number
}

export default function InvoiceList({ refreshTrigger }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const fetchInvoices = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:3000/api/invoices/${email}`)
      setInvoices(response.data.data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [email, refreshTrigger])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-green-100 text-green-800'
      case 'validated': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Your Invoices</h2>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to view invoices"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="text-center py-4">Loading...</div>
      )}

      {!loading && invoices.length === 0 && email && (
        <div className="text-center py-4 text-gray-500">
          No invoices found for this email
        </div>
      )}

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{invoice.file_name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              Uploaded: {new Date(invoice.uploaded_at).toLocaleString()}
            </p>

            {invoice.extracted_metadata && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Data:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {invoice.extracted_metadata.invoiceNumber && (
                    <div>Invoice #: {invoice.extracted_metadata.invoiceNumber}</div>
                  )}
                  {invoice.extracted_metadata.customerName && (
                    <div>Customer: {invoice.extracted_metadata.customerName}</div>
                  )}
                  {invoice.extracted_metadata.grossTotal && (
                    <div>Total: {invoice.extracted_metadata.grossTotal} {invoice.extracted_metadata.currency}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}