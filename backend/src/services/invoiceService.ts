import { UserModel } from '../models/User';
import { InvoiceModel } from '../models/Invoice';
import { S3Service } from './s3Service';
import { DocumentProcessingService } from './documentProcessingService';
import { CreateInvoiceRequest } from '../types';

export class InvoiceService {
  private userModel: UserModel;
  private invoiceModel: InvoiceModel;
  private s3Service: S3Service;
  private processingService: DocumentProcessingService;

  constructor() {
    this.userModel = new UserModel();
    this.invoiceModel = new InvoiceModel();
    this.s3Service = new S3Service();
    this.processingService = new DocumentProcessingService();
  }

  async uploadInvoice(
    data: CreateInvoiceRequest,
    file: Express.Multer.File
  ) {
    // Find or create user
    let user = await this.userModel.findByEmail(data.email);
    if (!user) {
      user = await this.userModel.create(data.userName, data.email);
    }

    // Upload to S3
    const s3Result = await this.s3Service.uploadFile(file, user.id);

    // Create invoice record with S3 data
    const invoice = await this.invoiceModel.create(
      user.id,
      file.originalname,
      s3Result.key, // Store S3 key as filePath
      file.size,
      file.mimetype
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      invoice: {
        id: invoice.id,
        fileName: invoice.fileName,
        s3Url: s3Result.url,
        uploadedAt: invoice.uploadedAt
      }
    };
  }

  async getUserInvoices(email: string) {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const invoices = await this.invoiceModel.findByUserId(user.id);
    return { user, invoices };
  }
}