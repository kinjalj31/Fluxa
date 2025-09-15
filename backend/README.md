# Fluxa Backend - Invoice OCR API

Node.js backend service for invoice processing with AWS Textract OCR integration.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Layer     │    │  Workflows      │    │  Infrastructure │
│                 │    │                 │    │                 │
│ • Express Routes│◄──►│ • Invoice Logic │◄──►│ • AWS Services  │
│ • Validation    │    │ • OCR Processing│    │ • Database      │
│ • Error Handling│    │ • File Storage  │    │ • Message Queue │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                    # API route handlers
│   │   └── invoices/
│   ├── workflows/              # Business logic
│   │   ├── invoice-workflows.ts
│   │   ├── textract-workflows.ts
│   │   └── textract-notification-handler.ts
│   ├── infrastructure/         # External services
│   │   └── messaging/
│   ├── library/               # Data access layer
│   │   └── invoice/
│   ├── database/              # Database setup
│   │   ├── migrations/
│   │   └── models/
│   └── config/                # Configuration
├── .env                       # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS Account with Textract access

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb

   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET_NAME=your-bucket-name

   # Textract SNS/SQS
   TEXTRACT_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:account:topic
   TEXTRACT_ROLE_ARN=arn:aws:iam::account:role/TextractServiceRole
   TEXTRACT_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/queue

   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Database setup**
   ```bash
   npm run migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### invoices
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'uploaded',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### invoice_extracts
```sql
CREATE TABLE invoice_extracts (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  invoice_number VARCHAR(100),
  sender_address TEXT,
  receiver_address TEXT,
  product TEXT,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  vat_rate DECIMAL(5,2) DEFAULT 19.00,
  vat_amount DECIMAL(10,2),
  total_gross DECIMAL(10,2),
  bank_iban VARCHAR(34),
  bank_bic VARCHAR(11),
  bank_name VARCHAR(255),
  textract_job_id VARCHAR(100),
  processing_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 OCR Processing Flow

### 1. Upload Phase
```typescript
POST /api/invoices/upload
├── Validate file (PDF, size limits)
├── Create/find user record
├── Upload to S3 storage
├── Create invoice record
└── Start background OCR processing
```

### 2. OCR Processing Phase
```typescript
TextractWorkflows.processDocument()
├── StartDocumentAnalysisCommand → AWS Textract
├── Create initial extract record with JobId
├── Return immediately (non-blocking)
└── AWS processes in background (30s-5min)
```

### 3. Completion Phase
```typescript
SNS Notification → SQS Queue → Handler
├── Receive completion notification
├── GetDocumentAnalysisCommand → Extract results
├── Parse German invoice format
├── Update invoice_extracts table
└── Set status to 'completed'
```

## 🎯 API Endpoints

### Upload Invoice
```http
POST /api/invoices/upload
Content-Type: multipart/form-data

Form Data:
- userName: string
- email: string
- invoice: file (PDF)

Response:
{
  "success": true,
  "message": "Invoice uploaded successfully",
  "data": {
    "user": { "id": 1, "name": "John", "email": "john@example.com" },
    "invoice": { "id": 1, "file_name": "invoice.pdf", "status": "uploaded" }
  }
}
```

### Get All Invoices
```http
GET /api/invoices

Response:
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "file_name": "invoice.pdf",
        "status": "completed",
        "extract": {
          "invoice_number": "2025-001",
          "total_gross": 1190.00,
          "bank_iban": "DE12345678901234567890"
        }
      }
    ]
  }
}
```

## 🔧 German Invoice Processing

### Supported Fields
- **Invoice Number**: `Rechnung Nr. 2025-001`
- **Addresses**: Sender/Receiver with German format
- **Products**: Description and quantities
- **Amounts**: German number format (1.234,56)
- **VAT**: 19% German standard rate
- **Bank Details**: IBAN, BIC, Bank name

### Number Format Handling
```typescript
// German: 1.234,56 → English: 1234.56
parseNumber("1.234,56") // Returns 1234.56
parseNumber("190,00")   // Returns 190.00
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run test         # Run tests
```

### Database Operations
```bash
# View invoice data
node view-extracts.js

# Clear all tables
node clear-tables.js

# Check Textract job status
node check-textract-job.js
```

## 🔐 AWS Configuration

### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:StartDocumentAnalysis",
        "textract:GetDocumentAnalysis",
        "s3:GetObject",
        "s3:PutObject",
        "sns:Publish",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage"
      ],
      "Resource": "*"
    }
  ]
}
```

### SNS/SQS Setup
1. Create SNS topic for Textract notifications
2. Create SQS queue subscribed to SNS topic
3. Configure IAM role for Textract to publish to SNS
4. Set up queue permissions for message processing

## 📝 Logging

The application provides detailed logging for:
- API requests and responses
- OCR processing stages
- AWS service interactions
- Database operations
- Error handling

## 🚨 Error Handling

- **File validation** - Size, type, format checks
- **AWS service errors** - Retry logic and fallbacks
- **Database errors** - Transaction rollbacks
- **OCR failures** - Status updates and notifications

## 🔍 Monitoring

Monitor these key metrics:
- Invoice upload success rate
- OCR processing time
- Extraction accuracy
- Queue message processing
- Database performance

## 📞 Troubleshooting

### Common Issues

1. **Textract permissions** - Verify IAM role has SNS publish permissions
2. **SQS not receiving messages** - Check SNS subscription configuration
3. **Database connection** - Verify DATABASE_URL format
4. **S3 upload failures** - Check bucket permissions and region

### Debug Commands
```bash
# Check SQS messages
aws sqs receive-message --queue-url $TEXTRACT_SQS_QUEUE_URL

# Verify Textract job
aws textract get-document-analysis --job-id <job-id>

# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM invoices;"
```