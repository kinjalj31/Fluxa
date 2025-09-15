'use client'

import { Box, Typography, Grid } from '@mui/material'
import { InvoiceUploadForm } from '@/features/invoices/components/InvoiceUploadForm'
import { InvoiceListView } from '@/features/invoices/components/InvoiceListView'

export default function InvoicesPage() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Invoice Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <InvoiceUploadForm />
        </Grid>
        
        <Grid item xs={12} lg={8}>
          <InvoiceListView />
        </Grid>
      </Grid>
    </Box>
  )
}