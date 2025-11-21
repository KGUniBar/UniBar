import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './OrderList.css'

function OrderList() {
  const navigate = useNavigate()

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

  // 테이블 데이터 (예시)
  const tables = [
    { id: 1, name: '1번 테이블', menus: ['메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1'] },
    { id: 2, name: '2번 테이블', menus: [] },
    { id: 3, name: '3번 테이블', menus: ['메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1'] },
    { id: 4, name: '4번 테이블', menus: ['메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1'] },
    { id: 5, name: '5번 테이블', menus: ['메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1'] },
    { id: 6, name: '6번 테이블', menus: ['메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1', '메뉴명 X 1'] },
  ]

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
          <div className="header-greeting">000님 안녕하세요 :)</div>
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
              <div
                key={table.id}
                className="table-card"
                onClick={() => handleTableClick(table.id)}
              >
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

