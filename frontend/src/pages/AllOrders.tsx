import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './AllOrders.css'

interface OrderItem {
  id: number
  name: string
  quantity: number
}

interface Order {
  id: number
  tableId: number
  tableName: string
  items: OrderItem[]
  orderTime: string
  totalPrice?: number
}

function AllOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])

  // localStorage에서 전체 주문 내역 불러오기
  useEffect(() => {
    const loadAllOrders = () => {
      const savedOrders = localStorage.getItem('allOrders')
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      } else {
        setOrders([])
      }

    }
    

    loadAllOrders()
    
    // 주문 내역이 변경될 때마다 업데이트
    const handleStorageChange = () => {
      loadAllOrders()
    }

    window.addEventListener('storage', handleStorageChange)
    // 같은 탭에서 변경된 경우를 위해 interval로 체크
    const interval = setInterval(() => {
      loadAllOrders()
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // 현재 날짜 포맷팅
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[today.getDay()]
    return `${year}.${month}.${day} (${weekday})`
  }

  return (
    <div className="all-orders-container">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 상단 헤더 */}
        <div className="top-header">
          <div className="header-date">{getCurrentDate()}</div>
          <div className="header-greeting">000님 안녕하세요 :)</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 전체 주문내역 컨텐츠 */}
        <div className="all-orders-content">
          <h1 className="all-orders-title">전체 주문내역</h1>

          {/* 주문 목록 테이블 */}
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>테이블</th>
                  <th>주문 내역</th>
                  <th>주문 시간</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-table-message">
                      주문 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.tableName}</td>
                      <td>
                        <div className="order-items-list">
                          {order.items.map((item) => (
                            <div key={item.id} className="order-item-row">
                              {item.name} X {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{order.orderTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllOrders



