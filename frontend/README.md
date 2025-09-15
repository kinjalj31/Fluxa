# Fluxa Frontend - Invoice Management UI

Next.js React application for invoice upload and OCR result visualization.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   State Mgmt    │    │   API Layer     │
│                 │    │                 │    │                 │
│ • Upload Form   │◄──►│ • Redux Store   │◄──►│ • Axios Client  │
│ • Invoice List  │    │ • Async Thunks  │    │ • Type Safety   │
│ • Extraction UI │    │ • Error Handling│    │ • Request/Response│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
frontend/fluxa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── invoices/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── features/               # Feature-based components
│   │   └── invoices/
│   │       └── components/
│   │           ├── InvoiceUploadForm.tsx
│   │           └── InvoiceListView.tsx
│   ├── api/                    # API client layer
│   │   ├── index.ts
│   │   └── invoices.ts
│   ├── store/                  # Redux store
│   │   ├── slices/
│   │   │   └── invoiceSlice.ts
│   │   └── index.ts
│   ├── layouts/                # Layout components
│   ├── providers/              # Context providers
│   └── theme/                  # Material-UI theme
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on port 3000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend/fluxa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure environment variables**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access application**
   ```
   http://localhost:3001
   ```

## 🎨 UI Components

### Invoice Upload Form
- **Drag & drop** file upload interface
- **User information** input (name, email)
- **File validation** (PDF only, size limits)
- **Upload progress** indicators
- **Success/error** feedback

### Invoice List View
- **Responsive table** with pagination
- **File information** (name, size, date)
- **Processing status** indicators
- **Extraction report** with visual status
- **Real-time updates** via Redux

### Extraction Report
- **Color-coded fields** (✅ success, ⚪ missing)
- **Detailed breakdown** of extracted data:
  - Invoice number, addresses
  - Product details, quantities
  - Financial amounts, VAT
  - Bank information (IBAN, BIC)
- **Processing status** and job tracking

## 🔄 State Management

### Redux Store Structure
```typescript
interface RootState {
  invoice: {
    invoices: Invoice[]
    loading: boolean
    error: string | null
  }
  user: {
    users: User[]
    loading: boolean
    error: string | null
  }
}
```

### Async Actions
```typescript
// Upload invoice
dispatch(uploadInvoice({ userName, email, file }))

// Fetch all invoices
dispatch(fetchInvoices())
```

## 📡 API Integration

### Invoice API Client
```typescript
export const invoiceApi = {
  upload: async (data: UploadInvoiceRequest) => {
    const formData = new FormData()
    formData.append('userName', data.userName)
    formData.append('email', data.email)
    formData.append('invoice', data.file)
    
    return await api.post('/api/invoices/upload', formData)
  },
  
  getAll: async () => {
    return await api.get('/api/invoices')
  }
}
```

### Type Definitions
```typescript
interface Invoice {
  id: string
  file_name: string
  file_size: number
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  uploaded_at: string
  extract?: InvoiceExtract
}

interface InvoiceExtract {
  invoice_number: string | null
  sender_address: string | null
  total_gross: number | null
  bank_iban: string | null
  // ... other fields
}
```

## 🎨 Material-UI Theme

### Custom Theme Configuration
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
})
```

### Component Styling
- **Consistent spacing** using theme spacing units
- **Responsive design** with breakpoints
- **Color system** for status indicators
- **Typography scale** for hierarchy

## 📱 Responsive Design

### Breakpoints
- **xs**: 0px - Mobile phones
- **sm**: 600px - Tablets
- **md**: 900px - Small laptops
- **lg**: 1200px - Desktops
- **xl**: 1536px - Large screens

### Layout Adaptation
```typescript
<Grid container spacing={3}>
  <Grid item xs={12} lg={4}>
    <InvoiceUploadForm />
  </Grid>
  <Grid item xs={12} lg={8}>
    <InvoiceListView />
  </Grid>
</Grid>
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Development Features
- **Hot reload** for instant updates
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## 🎯 Features

### File Upload
- **Drag & drop** interface
- **File type validation** (PDF only)
- **Size limit enforcement** (10MB max)
- **Progress indicators**
- **Error handling** with user feedback

### Data Visualization
- **Status indicators** with color coding:
  - 🔵 Uploaded - File received
  - 🟡 Processing - OCR in progress
  - 🟢 Completed - Extraction finished
  - 🔴 Failed - Processing error

### Extraction Report
- **Field-by-field breakdown**:
  - ✅ **Available**: Green checkmark
  - ⚪ **Missing**: Grey circle
- **Detailed information** display
- **Processing metadata** (job ID, timestamps)

### User Experience
- **Responsive design** for all devices
- **Loading states** during operations
- **Error boundaries** for graceful failures
- **Accessibility** compliance

## 🔍 Component Details

### InvoiceUploadForm.tsx
```typescript
const InvoiceUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  
  const handleSubmit = async () => {
    await dispatch(uploadInvoice({ userName, email, file }))
  }
  
  return (
    // Drag & drop UI with validation
  )
}
```

### InvoiceListView.tsx
```typescript
const InvoiceListView: React.FC = () => {
  const { invoices, loading } = useAppSelector(state => state.invoice)
  
  useEffect(() => {
    dispatch(fetchInvoices())
  }, [])
  
  return (
    // Table with extraction reports
  )
}
```

## 🚨 Error Handling

### API Error Handling
```typescript
extraReducers: (builder) => {
  builder
    .addCase(uploadInvoice.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Upload failed'
    })
}
```

### User Feedback
- **Toast notifications** for success/error
- **Loading spinners** during operations
- **Error messages** with actionable guidance
- **Retry mechanisms** for failed operations

## 🔐 Security

### Input Validation
- **File type restrictions** (PDF only)
- **Size limitations** (10MB max)
- **Email format validation**
- **XSS prevention** with proper escaping

### API Security
- **CORS configuration** for allowed origins
- **Request timeout** handling
- **Error message sanitization**

## 📊 Performance

### Optimization Techniques
- **Code splitting** with Next.js
- **Image optimization** for assets
- **Bundle analysis** for size monitoring
- **Lazy loading** for components

### Monitoring
- **Loading states** for user feedback
- **Error tracking** for debugging
- **Performance metrics** collection

## 🧪 Testing

### Testing Strategy
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Test Coverage
- **Component rendering** tests
- **User interaction** tests
- **API integration** tests
- **Error scenario** tests

## 📞 Troubleshooting

### Common Issues

1. **API connection errors**
   - Verify backend is running on port 3000
   - Check NEXT_PUBLIC_API_URL configuration

2. **File upload failures**
   - Ensure file is PDF format
   - Check file size (max 10MB)
   - Verify network connectivity

3. **Data not loading**
   - Check browser console for errors
   - Verify Redux store state
   - Test API endpoints directly

### Debug Tools
- **Redux DevTools** for state inspection
- **React Developer Tools** for component debugging
- **Network tab** for API request monitoring
- **Console logs** for error tracking