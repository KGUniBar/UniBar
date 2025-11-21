import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'
import './OrderDetail.css'

function OrderDetail() {
  const navigate = useNavigate()
  const { tableId } = useParams<{ tableId: string }>()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

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

  // 예시 메뉴 데이터
  const menuItems = [
    { id: 1, name: '메뉴명', price: 10000 },
    { id: 2, name: '메뉴명', price: 15000 },
    { id: 3, name: '메뉴명', price: 12000 },
    { id: 4, name: '메뉴명', price: 18000 },
    { id: 5, name: '메뉴명', price: 20000 },
    { id: 6, name: '메뉴명', price: 16000 },
  ]

  const orderItems = [
    { id: 1, name: '메뉴명', quantity: 1 },
    { id: 2, name: '메뉴명', quantity: 1 },
    { id: 3, name: '메뉴명', quantity: 1 },
    { id: 4, name: '메뉴명', quantity: 1 },
  ]

  const totalPrice = orderItems.reduce((sum, item) => {
    const menuItem = menuItems.find(m => m.name === item.name)
    return sum + (menuItem ? menuItem.price * item.quantity : 0)
  }, 0)

  const handleOrderClick = () => {
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    // 결제 완료 처리 (나중에 구현)
    console.log('결제 완료')
    setIsPaymentModalOpen(false)
  }

  return (
    <div className="order-detail-container">
      {/* 좌측 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">LOGO</div>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">홀</div>
          <div className="menu-item">예약</div>
          <div className="menu-item active" onClick={() => navigate('/order')}>주문</div>
          <div className="menu-item">주방</div>
          <div className="menu-item">잔여 주문 내역</div>
          <div className="menu-item">금일 주문 내역</div>
          <div className="menu-spacer"></div>
          <div className="menu-item">Setting</div>
        </div>
      </div>

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

        {/* 주문 상세 컨텐츠 */}
        <div className="order-detail-content">
          <h1 className="order-detail-title">{tableId}번 테이블 주문 상세</h1>

          <div className="order-detail-body">
            {/* 왼쪽: 메뉴 카드들 */}
            <div className="menu-cards-section">
              <div className="menu-cards-grid">
                {menuItems.map((menu) => (
                  <div key={menu.id} className="menu-card">
                    <div className="menu-card-header">
                      <h3 className="menu-name">{menu.name}</h3>
                    </div>
                    <div className="menu-card-body">
                      <div className="menu-price">{menu.price.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽: 주문 내역 및 주문하기 */}
            <div className="order-summary-section">
              <div className="order-tabs">
                <button className="order-tab">주문내역</button>
                <button className="order-tab active">테이블 종료</button>
              </div>

              <div className="order-list-box">
                <div className="order-list">
                  {orderItems.map((item) => (
                    <div key={item.id} className="order-list-item">
                      <span className="order-item-name">{item.name}</span>
                      <div className="quantity-controls">
                        <button className="quantity-btn">-</button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button className="quantity-btn">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="order-button" onClick={handleOrderClick}>
                {totalPrice.toLocaleString()}원 주문하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 팝업 */}
      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          totalPrice={totalPrice}
        />
      )}
    </div>
  )
}

export default OrderDetail

