import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { Invoice } from '../types';

export class InvoiceModel {
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
  }

  async create(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string
  ): Promise<Invoice> {
    return this.invoiceRepository.create(userId, fileName, filePath, fileSize, mimeType);
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.invoiceRepository.deleteInvoice(id);
  }

  async findByUserEmail(email: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByUserEmail(email);
  }
}