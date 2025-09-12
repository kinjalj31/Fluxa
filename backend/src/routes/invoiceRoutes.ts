import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';
import { upload } from '../config/multer';

const router = Router();
const invoiceController = new InvoiceController();

// POST /api/invoices - Upload invoice PDF
router.post('/', upload.single('invoice'), invoiceController.uploadInvoice);

// GET /api/invoices/:email - Get user's invoices
router.get('/:email', invoiceController.getUserInvoices);

// GET /api/invoices/status/:id - Get document processing status
router.get('/status/:id', invoiceController.getDocumentStatus);

export default router;