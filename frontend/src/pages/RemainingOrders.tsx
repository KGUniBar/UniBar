import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getRemainingOrders, completeOrder, type Order } from '../api/orderClient'
import './RemainingOrders.css'

function RemainingOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderInfo, setSelectedOrderInfo] = useState<Order | null>(null)

  // DB에서 잔여 주문(결제 완료 + 조리 미완료) 불러오기
  useEffect(() => {
    const loadRemainingOrders = async () => {
      try {
        const data = await getRemainingOrders()
        setOrders(data)
      } catch (error) {
        console.error('잔여 주문 불러오기 실패:', error)
        setOrders([])
      }
    }

    loadRemainingOrders()

    // 간단한 폴링으로 주기적인 갱신
    const interval = setInterval(() => {
      loadRemainingOrders()
    }, 3000)

    return () => {
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

  const handleCompleteClick = (order: Order) => {
    if (!order.id) return
    setSelectedOrderId(order.id)
    setSelectedOrderInfo(order)
    setIsCompleteModalOpen(true)
  }

  const handleConfirmComplete = async () => {
    if (!selectedOrderId) return

    try {
      await completeOrder(selectedOrderId)
      setOrders((prev) => prev.filter(order => order.id !== selectedOrderId))
    } catch (error) {
      console.error('조리 완료 처리 실패:', error)
      alert(error instanceof Error ? error.message : '조리 완료 처리에 실패했습니다.')
    } finally {
      setIsCompleteModalOpen(false)
      setSelectedOrderId(null)
      setSelectedOrderInfo(null)
    }
  }

  const handleCancelComplete = () => {
    setIsCompleteModalOpen(false)
    setSelectedOrderId(null)
    setSelectedOrderInfo(null)
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
          <div className="header-greeting">{localStorage.getItem('userName') || '000'}님 안녕하세요 :)</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 잔여 주문내역 컨텐츠 */}
        <div className="remaining-orders-content">
          <h1 className="remaining-orders-title">잔여 주문내역</h1>

          {/* 주문 목록 */}
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="empty-orders-message">조리 완료되지 않은 주문이 없습니다.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <h3 className="table-name">{order.tableName}</h3>
                    <div className="order-time">주문 시간: {order.orderTime}</div>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">X {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="complete-button"
                    onClick={() => handleCompleteClick(order)}
                  >
                    조리 완료
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 조리 완료 확인 팝업 */}
      {isCompleteModalOpen && selectedOrderInfo && (
        <div className="confirm-modal-overlay" onClick={handleCancelComplete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">조리 완료</h2>
            <p className="confirm-modal-message">
              {selectedOrderInfo.tableName}의 주문이 조리 완료되었습니까?<br />
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                {selectedOrderInfo.items.map((item, index) => (
                  <div key={index}>{item.name} X {item.quantity}</div>
                ))}
              </div>
            </p>
            <div className="confirm-modal-buttons">
              <button className="confirm-button cancel" onClick={handleCancelComplete}>
                취소
              </button>
              <button className="confirm-button confirm" onClick={handleConfirmComplete}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemainingOrders

