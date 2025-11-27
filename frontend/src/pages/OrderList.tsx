import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getRemainingOrders, type Order } from '../api/orderClient'
import './OrderList.css'

function OrderList() {
  const navigate = useNavigate()
  const [tableCount, setTableCount] = useState<number>(8)

  // localStorage에서 테이블 수 불러오기
  useEffect(() => {
    const savedTableCount = localStorage.getItem('tableCount')
    if (savedTableCount) {
      setTableCount(parseInt(savedTableCount, 10))
    }
  }, [])

  // 테이블 수가 변경될 때마다 업데이트 (다른 탭에서 변경했을 경우)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTableCount = localStorage.getItem('tableCount')
      if (savedTableCount) {
        setTableCount(parseInt(savedTableCount, 10))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(() => {
      const savedTableCount = localStorage.getItem('tableCount')
      if (savedTableCount && parseInt(savedTableCount, 10) !== tableCount) {
        setTableCount(parseInt(savedTableCount, 10))
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
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

  const [ordersByTable, setOrdersByTable] = useState<{ [key: number]: { name: string; quantity: number }[] }>({})

  // DB에서 테이블별 잔여 주문(결제 완료 + 조리 미완료) 불러오기
  useEffect(() => {
    const loadTableOrders = async () => {
      try {
        const remainingOrders = await getRemainingOrders()
        const grouped: { [key: number]: { name: string; quantity: number }[] } = {}

        remainingOrders.forEach((order: Order) => {
          if (order.tableId == null) return
          const tableId = order.tableId
          if (!grouped[tableId]) {
            grouped[tableId] = []
          }

          order.items.forEach((item) => {
            const existing = grouped[tableId].find((m) => m.name === item.name)
            if (existing) {
              existing.quantity += item.quantity
            } else {
              grouped[tableId].push({ name: item.name, quantity: item.quantity })
            }
          })
        })

        setOrdersByTable(grouped)
      } catch (error) {
        console.error('테이블별 잔여 주문 불러오기 실패:', error)
        setOrdersByTable({})
      }
    }

    loadTableOrders()

    const interval = setInterval(() => {
      loadTableOrders()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [tableCount])

  // 테이블 데이터 생성 (설정된 테이블 수만큼)
  const tables = Array.from({ length: tableCount }, (_, index) => {
    const tableId = index + 1
    const items = ordersByTable[tableId] || []

    const menus = items.map((item) => `${item.name} x${item.quantity}`)

    return {
      id: tableId,
      name: `${tableId}번 테이블`,
      menus,
    }
  })

  const handleTableClick = (tableId: number) => {
    navigate(`/order/${tableId}`)
  }

  return (
    <div className="order-list-container">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 상단 헤더 */}
        <div className="top-header">
          <div className="header-date">{getCurrentDate()}</div>
          <div className="header-greeting">{localStorage.getItem('userName') || '000'}님 안녕하세요 :)</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 주문 목록 컨텐츠 */}
        <div className="order-list-content">
          <h1 className="order-list-title">홀 주문</h1>

          {/* 테이블 그리드 */}
          <div className="tables-grid">
            {tables.map((table) => (
              <div key={table.id} className="table-card" onClick={() => handleTableClick(table.id)}>
                <div className="table-card-header">
                  <h3 className="table-name">{table.name}</h3>
                </div>
                <div className="table-card-body">
                  {table.menus.length > 0 ? (
                    table.menus.map((menu, index) => (
                      <div key={index} className="menu-item-text">
                        {menu}
                      </div>
                    ))
                  ) : (
                    <div className="empty-table">주문 없음</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderList

