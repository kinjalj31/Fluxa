export type OCRResult = {
  text: string;
  confidence: number;
  language: string;
};

export type GermanInvoiceMetadata = {
  invoiceNumber?: string;
  invoiceDate?: string;
  sellerName?: string;
  sellerAddress?: string;
  sellerVatId?: string;
  sellerTaxNumber?: string;
  sellerContact?: string;
  customerName?: string;
  customerAddress?: string;
  customerVatId?: string;
  deliveryDate?: string;
  serviceDescription?: string;
  netAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  grossTotal?: number;
  currency?: string;
  iban?: string;
  bic?: string;
  paymentDeadline?: string;
  earlyPaymentDiscount?: string;
  reverseCharge?: boolean;
  smallBusinessExemption?: boolean;
};

export class OCRInfrastructure {
  async simulateOCR(fileBuffer: Buffer): Promise<OCRResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `RECHNUNG

Rechnungsnummer: RE-2024-001
Rechnungsdatum: 09.12.2024

Verkäufer:
Mustermann GmbH
Musterstraße 123
10115 Berlin
USt-IdNr.: DE123456789

Kunde:
Max Musterkunde
Kundenstraße 456
20095 Hamburg

Leistungsdatum: 05.12.2024
Beschreibung: Webentwicklung und Design

Nettobetrag: 3.400,00 EUR
MwSt. 19%: 646,00 EUR
Gesamtbetrag: 4.046,00 EUR

IBAN: DE89 3704 0044 0532 0130 00
BIC: COBADEFFXXX
Zahlbar innerhalb von 14 Tagen`,
          confidence: 0.95,
          language: "de",
        });
      }, 1500);
    });
  }

  extractGermanInvoiceMetadata(ocrText: string): GermanInvoiceMetadata {
    const metadata: GermanInvoiceMetadata = {};

    const invoiceNumMatch = ocrText.match(/Rechnungsnummer:\s*([A-Z0-9-]+)/i);
    if (invoiceNumMatch) metadata.invoiceNumber = invoiceNumMatch[1];

    const invoiceDateMatch = ocrText.match(/Rechnungsdatum:\s*(\d{2}\.\d{2}\.\d{4})/i);
    if (invoiceDateMatch) metadata.invoiceDate = invoiceDateMatch[1];

    const sellerMatch = ocrText.match(/Verkäufer:\s*\n([^\n]+)/i);
    if (sellerMatch) metadata.sellerName = sellerMatch[1].trim();

    const vatIdMatch = ocrText.match(/USt-IdNr\.:\s*(DE\d+)/i);
    if (vatIdMatch) metadata.sellerVatId = vatIdMatch[1];

    const customerMatch = ocrText.match(/Kunde:\s*\n([^\n]+)/i);
    if (customerMatch) metadata.customerName = customerMatch[1].trim();

    const deliveryDateMatch = ocrText.match(/Leistungsdatum:\s*(\d{2}\.\d{2}\.\d{4})/i);
    if (deliveryDateMatch) metadata.deliveryDate = deliveryDateMatch[1];

    const descriptionMatch = ocrText.match(/Beschreibung:\s*([^\n]+)/i);
    if (descriptionMatch) metadata.serviceDescription = descriptionMatch[1].trim();

    const netAmountMatch = ocrText.match(/Nettobetrag:\s*([\d.,]+)\s*EUR/i);
    if (netAmountMatch) {
      metadata.netAmount = parseFloat(netAmountMatch[1].replace(/\./g, '').replace(',', '.'));
      metadata.currency = 'EUR';
    }

    const vatRateMatch = ocrText.match(/MwSt\.\s*(\d+)%/i);
    if (vatRateMatch) metadata.vatRate = parseInt(vatRateMatch[1]);

    const vatAmountMatch = ocrText.match(/MwSt\.\s*\d+%:\s*([\d.,]+)\s*EUR/i);
    if (vatAmountMatch) {
      metadata.vatAmount = parseFloat(vatAmountMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    const grossTotalMatch = ocrText.match(/Gesamtbetrag:\s*([\d.,]+)\s*EUR/i);
    if (grossTotalMatch) {
      metadata.grossTotal = parseFloat(grossTotalMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    const ibanMatch = ocrText.match(/IBAN:\s*([A-Z0-9\s]+)/i);
    if (ibanMatch) metadata.iban = ibanMatch[1].replace(/\s/g, '');

    const bicMatch = ocrText.match(/BIC:\s*([A-Z0-9]+)/i);
    if (bicMatch) metadata.bic = bicMatch[1];

    const paymentDeadlineMatch = ocrText.match(/Zahlbar innerhalb von (\d+) Tagen/i);
    if (paymentDeadlineMatch) metadata.paymentDeadline = `${paymentDeadlineMatch[1]} Tage`;

    return metadata;
  }
}