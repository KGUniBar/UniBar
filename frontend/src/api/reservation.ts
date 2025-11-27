import { getAuthHeaders } from "./client.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface Reservation {
  id?: string
  reservationId?: number
  customerName: string
  phoneNumber: string
  reservationTime: Date
  numberOfGuests: number
  status: string
  createdAt?: string
}

// A type for the raw reservation data received from the API
interface RawReservation extends Omit<Reservation, 'reservationTime'> {
  reservationTime: string;
}

const toReservation = (raw: RawReservation): Reservation => ({
  ...raw,
  reservationTime: new Date(raw.reservationTime),
});


// 예약 목록 조회 API
export const getReservations = async (): Promise<Reservation[]> => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error('예약 목록을 불러오는 데 실패했습니다.')
  }
  const rawReservations: RawReservation[] = await response.json();
  return rawReservations.map(toReservation);
}

// 예약 생성 API
export const createReservation = async (reservationData: Omit<Reservation, 'id' | 'reservationId' | 'createdAt'>): Promise<Reservation> => {
  const body = {
    ...reservationData,
    reservationTime: reservationData.reservationTime.toISOString(),
  };
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error('예약 생성에 실패했습니다.')
  }
  const rawReservation: RawReservation = await response.json();
  return toReservation(rawReservation);
}

// 예약 수정 API
export const updateReservation = async (id: string, reservationData: Partial<Omit<Reservation, 'id' | 'reservationId' | 'createdAt'>>): Promise<Reservation> => {
  const body = {
    ...reservationData,
    ...(reservationData.reservationTime && { reservationTime: reservationData.reservationTime.toISOString() }),
  };
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error('예약 수정에 실패했습니다.')
  }
  const rawReservation: RawReservation = await response.json();
  return toReservation(rawReservation);
}

// 예약 삭제 API
export const deleteReservation = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error('예약 삭제에 실패했습니다.')
  }
}
