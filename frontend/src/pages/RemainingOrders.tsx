import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './RemainingOrders.css'

interface OrderItem {
  id: number
  name: string
  quantity: number
}

interface TableOrder {
  tableId: number
  tableName: string
  items: OrderItem[]
  completedAt?: string
}

function RemainingOrders() {
  const navigate = useNavigate()
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([])
  const [tableCount, setTableCount] = useState<number>(8)

  // localStorage에서 테이블 수 불러오기
  useEffect(() => {
    const savedTableCount = localStorage.getItem('tableCount')
    if (savedTableCount) {
      setTableCount(parseInt(savedTableCount, 10))
    }
  }, [])

  // localStorage에서 테이블별 주문 내역 불러오기
  useEffect(() => {
    const loadTableOrders = () => {
      const orders: TableOrder[] = []
      
      for (let i = 1; i <= tableCount; i++) {
        const savedOrders = localStorage.getItem(`tableOrders_${i}`)
        if (savedOrders) {
          const items = JSON.parse(savedOrders)
          if (items.length > 0) {
            orders.push({
              tableId: i,
              tableName: `${i}번 테이블`,
              items: items.map((item: any) => ({
                id: item.menuId,
                name: item.name,
                quantity: item.quantity
              }))
            })
          }
        }
      }
      
      setTableOrders(orders)
    }
    
    loadTableOrders()
    
    // 주문 내역이 변경될 때마다 업데이트
    const interval = setInterval(() => {
      loadTableOrders()
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [tableCount])

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

  // 현재 시간 포맷팅 (HH:MM)
  const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const handleComplete = (tableId: number) => {
    const completedTime = getCurrentTime()
    setTableOrders(tableOrders.map(order => 
      order.tableId === tableId 
        ? { ...order, completedAt: completedTime }
        : order
    ))
  }

  return (
    <div className="remaining-orders-container">
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

        {/* 잔여 주문내역 컨텐츠 */}
        <div className="remaining-orders-content">
          <h1 className="remaining-orders-title">잔여 주문내역</h1>

          {/* 주문 목록 */}
          <div className="orders-list">
            {tableOrders.map((tableOrder) => (
              <div key={tableOrder.tableId} className="order-card">
                <div className="order-card-header">
                  <h3 className="table-name">{tableOrder.tableName}</h3>
                  {tableOrder.completedAt && (
                    <div className="completed-time">
                      조리 완료: {tableOrder.completedAt}
                    </div>
                  )}
                </div>
                <div className="order-items">
                  {tableOrder.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">X {item.quantity}</span>
                    </div>
                  ))}
                </div>
                {!tableOrder.completedAt && (
                  <button 
                    className="complete-button"
                    onClick={() => handleComplete(tableOrder.tableId)}
                  >
                    조리 완료
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemainingOrders

