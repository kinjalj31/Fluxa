import { BaseRepository } from './BaseRepository';
import { Invoice } from '../types';

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices');
  }

  async create(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string
  ): Promise<Invoice> {
    return this.insert({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType,
      uploaded_at: 'NOW()'
    });
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return this.findMany({ user_id: userId }, 'uploaded_at DESC');
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.findOne({ id });
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findByUserEmail(email: string): Promise<Invoice[]> {
    const query = `
      SELECT i.* FROM invoices i
      JOIN users u ON i.user_id = u.id
      WHERE u.email = $1
      ORDER BY i.uploaded_at DESC
    `;
    const result = await this.executeQuery(query, [email]);
    return result.rows;
  }

  async findAll(): Promise<Invoice[]> {
    return this.findMany({}, 'uploaded_at DESC');
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await this.executeQuery(query, [status, id]);
  }

  async updateProcessingResults(
    id: string,
    ocrText: string,
    confidence: number,
    language: string,
    metadata: any
  ): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET 
        ocr_text = $1,
        ocr_confidence = $2,
        ocr_language = $3,
        extracted_metadata = $4,
        processed_at = NOW()
      WHERE id = $5
    `;
    await this.executeQuery(query, [ocrText, confidence, language, JSON.stringify(metadata), id]);
  }
}