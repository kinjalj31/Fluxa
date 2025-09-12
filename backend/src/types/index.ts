export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  s3Key?: string;
  s3Url?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface CreateInvoiceRequest {
  userName: string;
  email: string;
}