import { Invoice } from '@/shared/types/invoice'
import StatusBadge from '@/shared/components/StatusBadge'

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
        <StatusBadge status={invoice.status} />
      </div>

      {invoice.ocr_confidence && (
        <div className="mb-3">
          <div className="text-xs text-gray-600">
            OCR Confidence: {Math.round(invoice.ocr_confidence * 100)}%
          </div>
        </div>
      )}

      {invoice.extracted_metadata && (
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Extracted Data:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
            {invoice.extracted_metadata.invoiceNumber && (
              <div>
                <span className="font-medium">Rechnung #:</span> {invoice.extracted_metadata.invoiceNumber}
              </div>
            )}
            {invoice.extracted_metadata.invoiceDate && (
              <div>
                <span className="font-medium">Datum:</span> {invoice.extracted_metadata.invoiceDate}
              </div>
            )}
            {invoice.extracted_metadata.customerName && (
              <div>
                <span className="font-medium">Kunde:</span> {invoice.extracted_metadata.customerName}
              </div>
            )}
            {invoice.extracted_metadata.sellerName && (
              <div>
                <span className="font-medium">Verkäufer:</span> {invoice.extracted_metadata.sellerName}
              </div>
            )}
            {invoice.extracted_metadata.netAmount && (
              <div>
                <span className="font-medium">Netto:</span> {invoice.extracted_metadata.netAmount} {invoice.extracted_metadata.currency}
              </div>
            )}
            {invoice.extracted_metadata.grossTotal && (
              <div>
                <span className="font-medium">Gesamt:</span> {invoice.extracted_metadata.grossTotal} {invoice.extracted_metadata.currency}
              </div>
            )}
            {invoice.extracted_metadata.vatRate && (
              <div>
                <span className="font-medium">MwSt.:</span> {invoice.extracted_metadata.vatRate}%
              </div>
            )}
            {invoice.extracted_metadata.iban && (
              <div>
                <span className="font-medium">IBAN:</span> {invoice.extracted_metadata.iban}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}