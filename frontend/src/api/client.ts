// API 클라이언트 설정
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export interface LoginRequest {
  userId: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  user?: {
    id: string
    userId: string
    name?: string
  }
}

// 로그인 API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }))
    throw new Error(error.message || '로그인에 실패했습니다.')
  }

  return response.json()
}

// 로그아웃 API (필요시)
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('token')
  if (token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    localStorage.removeItem('token')
  }
}

export * from './reservation'
