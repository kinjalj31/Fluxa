import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { DocumentProcessingService } from '../services/documentProcessingService';

export class InvoiceController {
  private invoiceService: InvoiceService;
  private processingService: DocumentProcessingService;

  constructor() {
    this.invoiceService = new InvoiceService();
    this.processingService = new DocumentProcessingService();
  }

  uploadInvoice = async (req: Request, res: Response) => {
    try {
      console.log('\n=== UPLOAD ATTEMPT ===');
      console.log('Body:', req.body);
      console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
      
      const { userName, email } = req.body;
      const file = req.file;

      if (!file) {
        console.log('ERROR: No file provided');
        return res.status(400).json({ error: 'PDF file is required' });
      }

      if (!userName || !email) {
        console.log('ERROR: Missing userName or email');
        return res.status(400).json({ error: 'User name and email are required' });
      }

      console.log('Processing upload for:', { userName, email, fileName: file.originalname });
      const result = await this.invoiceService.uploadInvoice({ userName, email }, file);
      
      console.log('Upload successful!');
      
      // Trigger document processing asynchronously
      this.processingService.processDocument(result.invoice.id)
        .catch(error => console.error('Processing failed:', error));

      res.status(201).json({
        success: true,
        message: 'Invoice uploaded and processing started',
        data: result
      });
    } catch (error) {
      console.error('\n=== UPLOAD ERROR ===');
      console.error('Error:', error);
      console.error('==================\n');
      res.status(500).json({ error: 'Failed to upload invoice' });
    }
  };

  getUserInvoices = async (req: Request, res: Response) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await this.invoiceService.getUserInvoices(email);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ error: 'Failed to get invoices' });
    }
  };

  getDocumentStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      const status = await this.processingService.getDocumentStatus(id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({ error: 'Failed to get document status' });
    }
  };
}