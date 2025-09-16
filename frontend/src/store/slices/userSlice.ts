import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userApi, User, CreateUserRequest } from '@/api'

interface UserState {
  users: User[]
  stats: { totalUsers: number; recentUsers: User[] } | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  stats: null,
  loading: false,
  error: null,
}

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: CreateUserRequest) => {
    const response = await userApi.create(data)
    return response.data.user
  }
)

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async () => {
    const response = await userApi.getStats()
    return response.data
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload)
      })
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stats'
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer