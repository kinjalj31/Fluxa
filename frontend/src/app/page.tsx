'use client'

import { useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { InvoiceUploadForm } from '@/features/invoices/components/InvoiceUploadForm'
import { InvoiceListView } from '@/features/invoices/components/InvoiceListView'
import { UserStatsCard } from '@/features/users/components/UserStatsCard'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { useAppDispatch } from '@/store'
import { fetchInvoices } from '@/store/slices/invoiceSlice'
import { fetchUserStats } from '@/store/slices/userSlice'
import { Receipt } from '@mui/icons-material'

function HomePage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchInvoices())
    dispatch(fetchUserStats())
  }, [dispatch])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Receipt sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h3" component="h1" fontWeight={700}>
              Invoice Management
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
            Professional Invoice Processing & Analytics Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Upload, process, and manage your invoices with advanced OCR technology
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UserStatsCard />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <InvoiceUploadForm />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <InvoiceListView />
        </Grid>
      </Grid>
    </Box>
  )
}

HomePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
)

export default HomePage