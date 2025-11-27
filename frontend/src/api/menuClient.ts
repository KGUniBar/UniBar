import { jsonHeaders, parseError } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export interface Menu {
  id?: string
  menuId?: number
  name: string
  price: number
}

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token
    ? { ...jsonHeaders, Authorization: `Bearer ${token}` }
    : jsonHeaders
}

export const fetchMenus = async (): Promise<Menu[]> => {
  const response = await fetch(`${API_BASE_URL}/menus`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '메뉴 목록을 불러오는데 실패했습니다.')
  }

  return response.json()
}

export const createMenu = async (menu: Omit<Menu, 'id' | 'menuId'>): Promise<Menu> => {
  const response = await fetch(`${API_BASE_URL}/menus`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(menu),
  })

  if (!response.ok) {
    await parseError(response, '메뉴 등록에 실패했습니다.')
  }

  return response.json()
}

export const updateMenu = async (id: string, menu: Omit<Menu, 'id' | 'menuId'>): Promise<Menu> => {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(menu),
  })

  if (!response.ok) {
    await parseError(response, '메뉴 수정에 실패했습니다.')
  }

  return response.json()
}

export const deleteMenu = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    await parseError(response, '메뉴 삭제에 실패했습니다.')
  }
}


