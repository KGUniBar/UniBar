const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const jsonHeaders = { 'Content-Type': 'application/json' }

export const parseError = async (response: Response, defaultMessage: string) => {
  const text = await response.text()
  if (!text) {
    throw new Error(defaultMessage)
  }
  try {
    const json = JSON.parse(text)
    throw new Error(json.message || defaultMessage)
  } catch {
    throw new Error(text || defaultMessage)
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  password: string
  name: string
  phone: string
}

export interface LoginResponse {
  token: string
  userId: string
  name: string
}

export interface PasswordResetRequest {
    username: string
    currentPassword: string
    newPassword: string
}

// 로그인 API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    await parseError(response, '로그인에 실패했습니다.')
  }

  return response.json()
}

// 회원가입 API
export const signup = async (data: SignupRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    await parseError(response, '회원가입에 실패했습니다.')
  }

  return response.text() // "회원가입 성공" 문자열 반환
}

// 비밀번호 재설정 API
export const resetPassword = async (data: PasswordResetRequest): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
  
    if (!response.ok) {
      await parseError(response, '비밀번호 재설정에 실패했습니다.')
    }
  
    return response.text()
}

// 로그아웃 API
export const logout = async (): Promise<void> => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('userName')
}
