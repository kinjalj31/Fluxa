# Fluxa - Invoice OCR Processing System

A complete invoice processing system with AWS Textract OCR integration, featuring automated data extraction from German invoices.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AWS Services  │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Textract)    │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST API      │    │ • S3 Storage    │
│ • Redux Store   │    │ • OCR Workflows │    │ • SNS/SQS       │
│ • Material-UI   │    │ • PostgreSQL    │    │ • IAM Roles     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

- **PDF Invoice Upload** - Drag & drop interface for invoice files
- **AWS Textract OCR** - Automated text extraction from German invoices
- **Real-time Processing** - Event-driven architecture with SNS/SQS
- **Data Extraction** - Structured extraction of invoice fields:
  - Invoice numbers, addresses, products
  - Amounts, VAT, bank details (IBAN/BIC)
- **Visual Reports** - Color-coded extraction status indicators
- **German Format Support** - Handles German number formats and VAT rates

## 📁 Project Structure

```
Fluxa/
├── backend/          # Node.js API server
├── frontend/         # Next.js React application
└── README.md         # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** + **TypeScript** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **AWS SDK** - Textract, S3, SNS, SQS integration
- **Multer** - File upload handling

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **Axios** - HTTP client

### AWS Services
- **Textract** - OCR processing
- **S3** - File storage
- **SNS** - Notifications
- **SQS** - Message queuing
- **IAM** - Access management

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS Account with Textract access
- AWS CLI configured

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Fluxa
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend/fluxa
   npm install
   cp .env.local.example .env.local
   # Configure API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## 📋 Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/appdb
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
TEXTRACT_SNS_TOPIC_ARN=arn:aws:sns:region:account:topic
TEXTRACT_SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account/queue
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🔄 Processing Flow

1. **Upload** - User uploads PDF invoice via frontend
2. **Storage** - File stored in AWS S3 bucket
3. **OCR Start** - Textract job initiated with SNS notifications
4. **Processing** - AWS processes document in background
5. **Notification** - SNS → SQS → Backend handler
6. **Extraction** - German invoice fields parsed and stored
7. **Display** - Frontend shows extraction results with status indicators

## 📊 Database Schema

### invoices
- File metadata and processing status

### invoice_extracts
- Extracted invoice data (amounts, addresses, bank details)

### users
- User information for invoice ownership

## 🎯 API Endpoints

- `POST /api/invoices/upload` - Upload invoice file
- `GET /api/invoices` - List all invoices with extraction data

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run migrate      # Run database migrations
```

### Frontend Development
```bash
cd frontend/fluxa
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.