import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PaymentModal from '../components/PaymentModal'
import './OrderDetail.css'

interface Menu {
  id: number
  name: string
  price: number
}

function OrderDetail() {
  const navigate = useNavigate()
  const { tableId } = useParams<{ tableId: string }>()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<Menu[]>([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // localStorage에서 메뉴 불러오기
  useEffect(() => {
    const loadMenus = () => {
      const savedMenus = localStorage.getItem('menus')
      if (savedMenus) {
        setMenuItems(JSON.parse(savedMenus))
      }
    }
    
    loadMenus()
    
    // 메뉴가 변경될 때마다 업데이트
    const handleStorageChange = () => {
      loadMenus()
    }

    window.addEventListener('storage', handleStorageChange)
    // 같은 탭에서 변경된 경우를 위해 interval로 체크
    const interval = setInterval(() => {
      loadMenus()
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

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

        {/* 주문 상세 컨텐츠 */}
        <div className="order-detail-content">
          <h1 className="order-detail-title">{tableId}번 테이블 주문 상세</h1>

          <div className="order-detail-body">
            {/* 왼쪽: 메뉴 카드들 */}
            <div className="menu-cards-section">
              {menuItems.length === 0 ? (
                <div className="no-menu-message">
                  등록된 메뉴가 없습니다.<br />
                  Setting 페이지에서 메뉴를 등록해주세요.
                </div>
              ) : (
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
              )}
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

