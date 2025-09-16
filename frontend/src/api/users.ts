import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
}

export const userApi = {
  create: async (data: CreateUserRequest) => {
    const response = await api.post('/api/users', data)
    return response.data
  },

  getByEmail: async (email: string) => {
    const response = await api.get(`/api/users/${email}`)
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/api/users/stats')
    return response.data
  }
}