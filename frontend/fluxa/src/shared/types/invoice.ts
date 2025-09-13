export interface Invoice {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: 'uploaded' | 'processing' | 'processed' | 'validated' | 'failed'
  uploaded_at: string
  processed_at?: string
  ocr_text?: string
  ocr_confidence?: number
  ocr_language?: string
  extracted_metadata?: GermanInvoiceMetadata
}

export interface GermanInvoiceMetadata {
  invoiceNumber?: string
  invoiceDate?: string
  sellerName?: string
  sellerAddress?: string
  sellerVatId?: string
  customerName?: string
  customerAddress?: string
  customerVatId?: string
  deliveryDate?: string
  serviceDescription?: string
  netAmount?: number
  vatRate?: number
  vatAmount?: number
  grossTotal?: number
  currency?: string
  iban?: string
  bic?: string
  paymentDeadline?: string
  earlyPaymentDiscount?: string
}

export interface UploadInvoiceRequest {
  userName: string
  email: string
  file: File
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}