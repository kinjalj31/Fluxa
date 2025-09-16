'use client'

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Divider,
  TablePagination,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Stack
} from '@mui/material'
import { 
  Receipt, 
  CheckCircle, 
  Schedule, 
  Error, 
  CloudDone,
  Visibility,
  GetApp,
  CheckCircleOutline,
  ErrorOutline,
  RemoveCircleOutline
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '@/store'
import { Invoice, InvoiceExtract } from '@/api'
import { fetchInvoices } from '@/store/slices/invoiceSlice'

type InvoiceStatus = Invoice['status']

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'uploaded': return 'info'
    case 'processing': return 'warning'
    case 'processed': return 'success'
    case 'completed': return 'success'
    case 'validated': return 'success'
    case 'failed': return 'error'
    default: return 'default'
  }
}

const getFieldStatus = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return { icon: <RemoveCircleOutline sx={{ color: 'grey.400', fontSize: 16 }} />, color: 'grey.400' }
  }
  return { icon: <CheckCircleOutline sx={{ color: 'success.main', fontSize: 16 }} />, color: 'success.main' }
}

const ExtractionReport: React.FC<{ extract?: InvoiceExtract }> = ({ extract }) => {
  if (!extract) {
    return (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No extraction data available
        </Typography>
      </Box>
    )
  }

  const fields = [
    { label: 'Invoice Number', value: extract.invoice_number },
    { label: 'Sender Address', value: extract.sender_address },
    { label: 'Receiver Address', value: extract.receiver_address },
    { label: 'Product', value: extract.product },
    { label: 'Quantity', value: extract.quantity },
    { label: 'Unit Price', value: extract.unit_price },
    { label: 'Subtotal', value: extract.subtotal },
    { label: 'VAT Amount', value: extract.vat_amount },
    { label: 'Total Gross', value: extract.total_gross },
    { label: 'Bank IBAN', value: extract.bank_iban },
    { label: 'Bank BIC', value: extract.bank_bic },
    { label: 'Bank Name', value: extract.bank_name }
  ]

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, minWidth: 400 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Extraction Report
      </Typography>
      <Grid container spacing={1}>
        {fields.map((field, index) => {
          const status = getFieldStatus(field.value)
          return (
            <Grid item xs={12} key={index}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {status.icon}
                <Typography variant="caption" sx={{ minWidth: 100, fontSize: '0.7rem' }}>
                  {field.label}:
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.7rem',
                    color: field.value ? 'text.primary' : 'text.secondary',
                    fontWeight: field.value ? 500 : 400
                  }}
                >
                  {field.value || 'Missing'}
                </Typography>
              </Stack>
            </Grid>
          )
        })}
      </Grid>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" color="text.secondary">
        Status: {extract.processing_status} | Job ID: {extract.textract_job_id?.slice(0, 8)}...
      </Typography>
    </Box>
  )
}

export const InvoiceListView: React.FC = () => {
  const dispatch = useAppDispatch()
  const { invoices, loading } = useAppSelector(state => state.invoice)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedInvoices = invoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'uploaded': return <Schedule />
      case 'processing': return <Schedule />
      case 'processed': return <CheckCircle />
      case 'completed': return <CheckCircle />
      case 'validated': return <CloudDone />
      case 'failed': return <Error />
      default: return <Receipt />
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Card 
      elevation={4}
      sx={{ 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Receipt />
          </Avatar>
        }
        title={
          <Typography variant="h5" fontWeight={600}>
            Invoice List
          </Typography>
        }
        subheader={`${invoices.length} total invoices`}
      />
      <Divider />
      
      <CardContent sx={{ p: 0 }}>
        {invoices.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            py={6}
            px={3}
          >
            <Receipt sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No invoices uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your first invoice to get started
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, width: '20%' }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '15%' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '55%' }}>Report</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '10%' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice, index) => (
                    <TableRow 
                      key={invoice.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'primary.light',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Receipt fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {invoice.file_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(invoice.file_size / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invoice.uploaded_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(invoice.uploaded_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '55%' }}>
                        <ExtractionReport extract={invoice.extract} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(invoice.status)}
                          label={invoice.status.toUpperCase()}
                          color={getStatusColor(invoice.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Divider />
            <TablePagination
              component="div"
              count={invoices.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ px: 2 }}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}