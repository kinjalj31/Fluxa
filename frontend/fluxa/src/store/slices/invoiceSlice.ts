 import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { invoiceApi, Invoice, UploadInvoiceRequest } from '@/api'

interface InvoiceState {
  invoices: Invoice[]
  loading: boolean
  error: string | null
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
}

export const uploadInvoice = createAsyncThunk(
  'invoice/uploadInvoice',
  async (data: UploadInvoiceRequest) => {
    const response = await invoiceApi.upload(data)
    return response.data.invoice
  }
)

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async () => {
    const response = await invoiceApi.getAll()
    return response.data.invoices
  }
)

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices.unshift(action.payload)
      })
      .addCase(uploadInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Upload failed'
      })
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch invoices'
      })
  },
})

export const { clearError } = invoiceSlice.actions
export default invoiceSlice.reducer