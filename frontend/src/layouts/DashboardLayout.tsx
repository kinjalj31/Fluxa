'use client'

import React from 'react'
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Paper,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material'
import { Receipt, Dashboard } from '@mui/icons-material'
import { useAppSelector } from '@/store'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { loading: invoiceLoading, error: invoiceError, invoices } = useAppSelector(state => state.invoice)
  const { loading: userLoading, error: userError } = useAppSelector(state => state.user)
  
  const isLoading = invoiceLoading || userLoading
  const error = invoiceError || userError

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Receipt />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Fluxa Invoice Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Professional Invoice Processing System
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<Dashboard />}
              label={`${invoices.length} Invoices`}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            {isLoading && (
              <Chip 
                label="Processing..."
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </Box>
        </Toolbar>
        {isLoading && <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'error.main',
              color: 'error.contrastText',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.dark'
            }}
          >
            <Typography variant="h6" gutterBottom>
              ⚠️ Error Occurred
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Paper>
        )}
        
        {children}
      </Container>
    </Box>
  )
}