const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export interface QrCode {
  id: string
  ownerId: string
  imageData: string
  createdAt: string
}

export const fetchQrCode = async (): Promise<QrCode | null> => {
  const response = await fetch(`${API_BASE_URL}/qrcode`)

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    throw new Error('QR 코드를 불러오지 못했습니다.')
  }

  return response.json()
}

export const uploadQrCode = async (imageData: string): Promise<QrCode> => {
  const response = await fetch(`${API_BASE_URL}/qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData }),
  })

  if (!response.ok) {
    throw new Error('QR 코드를 저장하지 못했습니다.')
  }

  return response.json()
}


