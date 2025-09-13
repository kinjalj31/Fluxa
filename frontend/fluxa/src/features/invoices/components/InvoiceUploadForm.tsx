'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material'
import { CloudUpload, Person, Email, Description } from '@mui/icons-material'
import { useInvoiceUpload } from '@/shared/hooks/useInvoices'

interface InvoiceUploadFormProps {
  onUploadSuccess: () => void
}

export default function InvoiceUploadForm({ onUploadSuccess }: InvoiceUploadFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    email: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { uploadInvoice, uploading, error, clearError } = useInvoiceUpload()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !formData.userName || !formData.email) {
      return
    }

    try {
      await uploadInvoice({
        userName: formData.userName,
        email: formData.email,
        file
      })

      setSuccessMessage('Invoice uploaded successfully! Processing started...')
      setFormData({ userName: '', email: '' })
      setFile(null)
      onUploadSuccess()
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      // Error handled by hook
    }
  }

  const isFormValid = formData.userName && formData.email && file

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.light',
              mx: 'auto',
              mb: 2
            }}
          >
            <Description sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Upload Invoice
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your German invoice PDF for processing
          </Typography>
        </Box>
      
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{
                  height: 80,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': { borderStyle: 'dashed' }
                }}
              >
                <Box textAlign="center">
                  <CloudUpload sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body1">
                    {file ? file.name : 'Click to upload PDF file'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only PDF files • Max 10MB
                  </Typography>
                </Box>
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={uploading || !isFormValid}
                sx={{ py: 2 }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing Upload...
                  </>
                ) : (
                  <>
                    <CloudUpload sx={{ mr: 1 }} />
                    Upload & Process Invoice
                  </>
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}