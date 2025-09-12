export type OCRResult = {
  text: string;
  confidence: number;
  language: string;
};

export type InvoiceMetadata = {
  customerName?: string;
  customerEmail?: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  date?: string;
  dueDate?: string;
};

export class OCRService {
  async simulateOCR(fileBuffer: Buffer): Promise<OCRResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "INVOICE #INV-2024-001\nBill To: John Doe\nEmail: john.doe@example.com\nAmount: $1,250.00\nDate: 2024-12-09\nDue Date: 2024-12-23\nDescription: Web Development Services",
          confidence: 0.98,
          language: "en",
        });
      }, 1500); // Simulate processing time
    });
  }

  extractInvoiceMetadata(ocrText: string): InvoiceMetadata {
    const metadata: InvoiceMetadata = {};

    // Extract invoice number
    const invoiceMatch = ocrText.match(/INVOICE\s*#?([A-Z0-9-]+)/i);
    if (invoiceMatch) metadata.invoiceNumber = invoiceMatch[1];

    // Extract customer name
    const nameMatch = ocrText.match(/Bill To:\s*([^\n]+)/i);
    if (nameMatch) metadata.customerName = nameMatch[1].trim();

    // Extract email
    const emailMatch = ocrText.match(/Email:\s*([^\s\n]+@[^\s\n]+)/i);
    if (emailMatch) metadata.customerEmail = emailMatch[1];

    // Extract amount
    const amountMatch = ocrText.match(/Amount:\s*\$?([\d,]+\.?\d*)/i);
    if (amountMatch) {
      metadata.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      metadata.currency = 'USD';
    }

    // Extract dates
    const dateMatch = ocrText.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) metadata.date = dateMatch[1];

    const dueDateMatch = ocrText.match(/Due Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (dueDateMatch) metadata.dueDate = dueDateMatch[1];

    return metadata;
  }

  validateInvoiceMetadata(metadata: InvoiceMetadata): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.invoiceNumber) errors.push('Invoice number is required');
    if (!metadata.customerName) errors.push('Customer name is required');
    if (!metadata.amount || metadata.amount <= 0) errors.push('Valid amount is required');
    if (!metadata.date) errors.push('Invoice date is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}