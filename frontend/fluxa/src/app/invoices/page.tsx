'use client'

import { useState } from 'react'
import { Box, Container, Typography, Chip, Stack } from '@mui/material'
import { Description, SmartToy, Analytics, CheckCircle } from '@mui/icons-material'
import InvoiceUploadForm from '@/features/invoices/components/InvoiceUploadForm'
import InvoiceListView from '@/features/invoices/components/InvoiceListView'

export default function InvoicesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Description sx={{ fontSize: 80, mb: 2 }} />
          </Box>
          <Typography variant="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Fluxa Invoice
          </Typography>
          
          <Typography variant="h5" sx={{ mb: 6, opacity: 0.9 }}>
            Advanced German invoice processing with OCR technology
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Chip
              icon={<Description />}
              label="German Invoices"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              icon={<SmartToy />}
              label="OCR Processing"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              icon={<Analytics />}
              label="Metadata Extraction"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              icon={<CheckCircle />}
              label="Validation"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Upload Form Section */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <InvoiceUploadForm onUploadSuccess={handleUploadSuccess} />
      </Container>

      {/* Invoice Listing Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <InvoiceListView refreshTrigger={refreshTrigger} />
        </Container>
      </Box>
    </Box>
  )
}