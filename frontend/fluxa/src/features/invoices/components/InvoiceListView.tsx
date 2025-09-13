'use client'

import { useState } from 'react'
import { useInvoices } from '@/shared/hooks/useInvoices'
import StatusBadge from '@/shared/components/StatusBadge'
import InvoiceCard from './InvoiceCard'

interface InvoiceListViewProps {
  refreshTrigger: number
}

export default function InvoiceListView({ refreshTrigger }: InvoiceListViewProps) {
  const [email, setEmail] = useState('')
  const { invoices, loading, error } = useInvoices(email, refreshTrigger)

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice History</h2>
        <p className="text-gray-600">View and track your processed invoices</p>
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🔍 Search by Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email to view invoices"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading invoices...
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="text-red-600">❌ {error}</div>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && email && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            📭 No invoices found for this email
          </div>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && !email && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            👆 Enter your email address to view invoices
          </div>
        </div>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </div>
  )
}