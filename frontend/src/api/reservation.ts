import { API_BASE_URL } from './client'

export interface Reservation {
  id: number
  tableNumber: number
  reservationTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

// 예약 목록 조회 API
export const getReservations = async (): Promise<Reservation[]> => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('예약 목록을 불러오는 데 실패했습니다.')
  }
  return response.json()
}

// 예약 생성 API
export const createReservation = async (reservationData: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(reservationData),
  })
  if (!response.ok) {
    throw new Error('예약 생성에 실패했습니다.')
  }
  return response.json()
}

// 예약 수정 API
export const updateReservation = async (id: number, reservationData: Partial<Reservation>): Promise<Reservation> => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(reservationData),
  })
  if (!response.ok) {
    throw new Error('예약 수정에 실패했습니다.')
  }
  return response.json()
}

// 예약 삭제 API
export const deleteReservation = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('예약 삭제에 실패했습니다.')
  }
}
