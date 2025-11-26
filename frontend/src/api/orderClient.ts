import { jsonHeaders, parseError } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

export interface Order {
  id?: string // MongoDB ID
  orderId?: number // Frontend Timestamp ID
  tableId: number
  tableName: string
  items: OrderItem[]
  totalPrice: number
  orderTime?: string
  orderDate?: string
  paid?: boolean
  completed?: boolean
}

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token
    ? { ...jsonHeaders, Authorization: `Bearer ${token}` }
    : jsonHeaders
}

export const createOrder = async (order: Order): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    await parseError(response, '주문 생성에 실패했습니다.')
  }

  return response.json()
}

export const payOrder = async (id: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
    method: 'POST',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '결제 처리에 실패했습니다.')
  }

  return response.json()
}

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '주문 목록을 불러오는데 실패했습니다.')
  }

  return response.json()
}

export const getTableOrders = async (tableId: number): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '테이블 주문 목록을 불러오는데 실패했습니다.')
  }

  return response.json()
}

export const getRemainingOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/remaining`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '잔여 주문을 불러오는데 실패했습니다.')
  }

  return response.json()
}

export const completeOrder = async (id: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '조리 완료 처리에 실패했습니다.')
  }

  return response.json()
}

