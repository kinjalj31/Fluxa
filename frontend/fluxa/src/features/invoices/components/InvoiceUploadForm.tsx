'use client'

import React, { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
  InputAdornment
} from '@mui/material'
import { CloudUpload, Person, Email, AttachFile } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/store'
import { uploadInvoice, clearError } from '@/store/slices/invoiceSlice'

export const InvoiceUploadForm: React.FC = () => {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)
  
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector(state => state.invoice)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!userName || !email || !file) {
      return
    }

    try {
      await dispatch(uploadInvoice({ userName, email, file })).unwrap()
      setSuccess(true)
      setUserName('')
      setEmail('')
      setFile(null)
      
      // Reset form
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      setTimeout(() => {
        setSuccess(false)
        dispatch(clearError())
      }, 3000)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <Card 
      elevation={4}
      sx={{ 
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Upload Invoice
            </Typography>
          </Box>
        }
        subheader="Upload PDF invoices for processing and analysis"
        sx={{ pb: 1 }}
      />
      <Divider />
      
      <CardContent sx={{ p: 3 }}>
        <Fade in={success}>
          <Box>
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 24 }
                }}
              >
                ✓ Invoice uploaded successfully!
              </Alert>
            )}
          </Box>
        </Fade>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 24 }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Box sx={{ mb: 3 }}>
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input">
              <Button
                variant={file ? "contained" : "outlined"}
                component="span"
                startIcon={<AttachFile />}
                fullWidth
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {file ? `📄 ${file.name}` : 'Select PDF File'}
              </Button>
            </label>
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!userName || !email || !file || loading}
            sx={{ 
              mt: 2,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Processing...
              </Box>
            ) : (
              'Upload Invoice'
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}