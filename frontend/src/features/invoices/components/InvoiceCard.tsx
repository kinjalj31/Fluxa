import { Invoice } from '@/api'
import { Chip } from '@mui/material'

interface InvoiceCardProps {
  invoice: Invoice
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{invoice.file_name}</h3>
          <p className="text-sm text-gray-500">
            Size: {formatFileSize(invoice.file_size)} • Uploaded: {formatDate(invoice.uploaded_at)}
          </p>
        </div>
        <Chip 
          label={invoice.status} 
          color={invoice.status === 'completed' ? 'success' : invoice.status === 'failed' ? 'error' : 'default'}
          size="small"
        />
      </div>

      {invoice.extract?.extraction_confidence && (
        <div className="mb-3">
          <div className="text-xs text-gray-600">
            OCR Confidence: {Math.round(invoice.extract.extraction_confidence * 100)}%
          </div>
        </div>
      )}

      {invoice.extract && (
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Extracted Data:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
            {invoice.extract.invoice_number && (
              <div>
                <span className="font-medium">Invoice #:</span> {invoice.extract.invoice_number}
              </div>
            )}
            {invoice.extract.sender_address && (
              <div>
                <span className="font-medium">Sender:</span> {invoice.extract.sender_address}
              </div>
            )}
            {invoice.extract.receiver_address && (
              <div>
                <span className="font-medium">Receiver:</span> {invoice.extract.receiver_address}
              </div>
            )}
            {invoice.extract.product && (
              <div>
                <span className="font-medium">Product:</span> {invoice.extract.product}
              </div>
            )}
            {invoice.extract.subtotal && (
              <div>
                <span className="font-medium">Subtotal:</span> {invoice.extract.subtotal}
              </div>
            )}
            {invoice.extract.total_gross && (
              <div>
                <span className="font-medium">Total:</span> {invoice.extract.total_gross}
              </div>
            )}
            {invoice.extract.vat_rate && (
              <div>
                <span className="font-medium">VAT:</span> {invoice.extract.vat_rate}%
              </div>
            )}
            {invoice.extract.bank_iban && (
              <div>
                <span className="font-medium">IBAN:</span> {invoice.extract.bank_iban}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}