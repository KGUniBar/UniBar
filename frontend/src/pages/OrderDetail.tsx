import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PaymentModal from '../components/PaymentModal'
import { fetchMenus, type Menu as ApiMenu } from '../api/menuClient'
import { createOrder, payOrder } from '../api/orderClient'
import './OrderDetail.css'

interface Menu {
  id: number
  name: string
  price: number
}

interface OrderItem {
  menuId: number
  name: string
  quantity: number
  price: number
}

function OrderDetail() {
  const navigate = useNavigate()
  const { tableId } = useParams<{ tableId: string }>()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isTableEndModalOpen, setIsTableEndModalOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<Menu[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // 서버에서 메뉴 불러오기
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data: ApiMenu[] = await fetchMenus()
        const mapped: Menu[] = data
          .filter(menu => menu.menuId != null)
          .map(menu => ({
            id: menu.menuId as number,
            name: menu.name,
            price: menu.price,
          }))
        setMenuItems(mapped)
      } catch (error) {
        console.error('메뉴 불러오기 실패:', error)
        setMenuItems([])
      }
    }

    loadMenus()
  }, [])

  // localStorage에서 테이블별 주문 내역 불러오기
  useEffect(() => {
    if (!tableId) return
    
    const loadTableOrders = () => {
      const savedOrders = localStorage.getItem(`tableOrders_${tableId}`)
      if (savedOrders) {
        setOrderItems(JSON.parse(savedOrders))
      } else {
        setOrderItems([])
      }
    }
    
    loadTableOrders()
    
    // 주문 내역이 변경될 때마다 업데이트
    const interval = setInterval(() => {
      loadTableOrders()
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [tableId])

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

  // 메뉴 클릭 핸들러 - 바로 주문 내역에 추가
  const handleMenuClick = (menu: Menu) => {
    const existingItem = orderItems.find(item => item.menuId === menu.id)
    
    let updatedItems: OrderItem[]
    if (existingItem) {
      // 이미 있는 메뉴면 수량만 증가
      updatedItems = orderItems.map(item =>
        item.menuId === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      // 새로운 메뉴면 추가
      updatedItems = [
        ...orderItems,
        {
          menuId: menu.id,
          name: menu.name,
          quantity: 1,
          price: menu.price
        }
      ]
    }

    setOrderItems(updatedItems)
    if (tableId) {
      localStorage.setItem(`tableOrders_${tableId}`, JSON.stringify(updatedItems))
    }
  }

  // 주문 내역에서 수량 조절
  const handleOrderItemQuantityChange = (menuId: number, delta: number) => {
    const updatedItems = orderItems.map(item => {
      if (item.menuId === menuId) {
        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) {
          return null // 삭제
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter((item): item is OrderItem => item !== null)

    setOrderItems(updatedItems)
    if (tableId) {
      localStorage.setItem(`tableOrders_${tableId}`, JSON.stringify(updatedItems))
    }
  }


  const totalPrice = orderItems.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const handleOrderClick = () => {
    if (!tableId) return

    if (orderItems.length === 0) {
      alert('주문할 메뉴를 선택해주세요.')
      return
    }
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = async () => {
    if (!tableId) return

    try {
      const now = new Date()
      const orderTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const orderData = {
        tableId: parseInt(tableId, 10),
        tableName: `${tableId}번 테이블`,
        items: orderItems.map(item => ({
          id: item.menuId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        orderTime,
        orderDate,
        totalPrice,
      }

      // 1) 백엔드에 주문 생성 + 결제 처리
      const createdOrder = await createOrder(orderData)
      if (createdOrder.id) {
        await payOrder(createdOrder.id)
      }

      // 2) 테이블 주문 내역 초기화 (새로운 주문을 받을 수 있도록)
      setOrderItems([])
      localStorage.removeItem(`tableOrders_${tableId}`)

      setIsPaymentModalOpen(false)
      alert('결제가 완료되었습니다.')
    } catch (error) {
      console.error('주문 처리 실패:', error)
      alert(error instanceof Error ? error.message : '주문 처리에 실패했습니다.')
    }
  }

  // 테이블 종료 핸들러
  const handleTableEndClick = () => {
    setIsTableEndModalOpen(true)
  }

  const handleConfirmTableEnd = () => {
    if (!tableId) return

    // 테이블 주문 내역 초기화
    setOrderItems([])
    localStorage.removeItem(`tableOrders_${tableId}`)

    setIsTableEndModalOpen(false)
  }

  const handleCancelTableEnd = () => {
    setIsTableEndModalOpen(false)
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
          <div className="header-greeting">{localStorage.getItem('userName') || '000'}님 안녕하세요 :)</div>
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
                    <div 
                      key={menu.id} 
                      className="menu-card"
                      onClick={() => handleMenuClick(menu)}
                    >
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
                <button className="order-tab active">주문내역</button>
                <button className="order-tab" onClick={handleTableEndClick}>테이블 종료</button>
              </div>

              <div className="order-list-box">
                <div className="order-list">
                  {orderItems.length === 0 ? (
                    <div className="empty-order-message">주문 내역이 없습니다.</div>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.menuId} className="order-list-item">
                        <span className="order-item-name">{item.name}</span>
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleOrderItemQuantityChange(item.menuId, -1)}
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleOrderItemQuantityChange(item.menuId, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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

      {/* 테이블 종료 확인 팝업 */}
      {isTableEndModalOpen && (
        <div className="confirm-modal-overlay" onClick={handleCancelTableEnd}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">테이블 종료</h2>
            <p className="confirm-modal-message">
              정말 {tableId}번 테이블을 종료하시겠습니까?<br />
              주문 내역이 초기화됩니다.
            </p>
            <div className="confirm-modal-buttons">
              <button className="confirm-button cancel" onClick={handleCancelTableEnd}>
                취소
              </button>
              <button className="confirm-button confirm" onClick={handleConfirmTableEnd}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail

