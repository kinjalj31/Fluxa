'use client'

import { useState } from 'react'
import axios from 'axios'

interface InvoiceUploadProps {
  onUploadSuccess: () => void
}

export default function InvoiceUpload({ onUploadSuccess }: InvoiceUploadProps) {
  const [formData, setFormData] = useState({
    userName: '',
    email: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !formData.userName || !formData.email) {
      setMessage('Please fill all fields and select a PDF file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const uploadData = new FormData()
      uploadData.append('userName', formData.userName)
      uploadData.append('email', formData.email)
      uploadData.append('invoice', file)

      const response = await axios.post('http://localhost:3000/api/invoices', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setMessage('Invoice uploaded successfully! Processing started...')
      setFormData({ userName: '', email: '' })
      setFile(null)
      onUploadSuccess()
      
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Upload Invoice</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({...formData, userName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Invoice'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}