'use client'

import React, { useState } from 'react'
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
  Tooltip
} from '@mui/material'
import { 
  Receipt, 
  CheckCircle, 
  Schedule, 
  Error, 
  CloudDone,
  Visibility,
  GetApp
} from '@mui/icons-material'
import { useAppSelector } from '@/store'
import { Invoice } from '@/api'

type InvoiceStatus = Invoice['status']

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'uploaded': return 'info'
    case 'processing': return 'warning'
    case 'processed': return 'success'
    case 'validated': return 'success'
    case 'failed': return 'error'
    default: return 'default'
  }
}

export const InvoiceListView: React.FC = () => {
  const { invoices, loading } = useAppSelector(state => state.invoice)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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
                    <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                            {index + 1 + page * rowsPerPage}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {invoice.file_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {String(invoice.id).slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
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
                      <TableCell>
                        <Typography variant="body2">
                          {(invoice.file_size / 1024).toFixed(1)} KB
                        </Typography>
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
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" color="secondary">
                              <GetApp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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