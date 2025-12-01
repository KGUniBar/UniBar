import { jsonHeaders, parseError } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export interface QrCode {
  id: string
  ownerId: string
  imageData: string
  createdAt: string
}

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { ...jsonHeaders, Authorization: `Bearer ${token}` } : jsonHeaders
}

export const fetchQrCode = async (): Promise<QrCode | null> => {
  const response = await fetch(`${API_BASE_URL}/qrcode`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    await parseError(response, 'QR 코드를 불러오지 못했습니다.')
  }

  return response.json()
}

export const uploadQrCode = async (imageData: string): Promise<QrCode> => {
  const response = await fetch(`${API_BASE_URL}/qrcode`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ imageData }),
  })

  if (!response.ok) {
    await parseError(response, 'QR 코드를 저장하지 못했습니다.')
  }

  return response.json()
}


