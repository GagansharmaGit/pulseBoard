import axios from 'axios'
import { useAuth } from '@clerk/react'

export const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

export function useApiClient() {
  const { getToken } = useAuth()

  api.interceptors.request.clear()
  api.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return api
}
