import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<'yesterday' | 'today' | 'week'>('today')

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
    <div className="dashboard-container">
      {/* 좌측 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">LOGO</div>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item active">홀</div>
          <div className="menu-item">예약</div>
          <div className="menu-item" onClick={() => navigate('/order')}>주문</div>
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

        {/* 대시보드 컨텐츠 */}
        <div className="dashboard-content">
          <h1 className="dashboard-title">대시보드</h1>

          {/* 날짜 필터 */}
          <div className="period-filter">
            <button
              className={`period-button ${selectedPeriod === 'yesterday' ? '' : 'inactive'}`}
              onClick={() => setSelectedPeriod('yesterday')}
            >
              어제
            </button>
            <button
              className={`period-button ${selectedPeriod === 'today' ? 'active' : 'inactive'}`}
              onClick={() => setSelectedPeriod('today')}
            >
              오늘
            </button>
            <button
              className={`period-button ${selectedPeriod === 'week' ? '' : 'inactive'}`}
              onClick={() => setSelectedPeriod('week')}
            >
              이번주
            </button>
          </div>

          {/* 통계 카드 */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-label">총 매출</div>
              <div className="stat-value">
                <span>0,000,000</span>
                <span className="stat-unit">원</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">예약 건</div>
              <div className="stat-value">
                <span>000</span>
                <span className="stat-unit">건</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">음식 주문 건</div>
              <div className="stat-value">
                <span>0,000</span>
                <span className="stat-unit">건</span>
              </div>
            </div>
          </div>

          {/* 시간대별 매출 차트 */}
          <div className="chart-container">
            <h2 className="chart-title">시간대별 매출</h2>
            {/* 차트 영역 - 나중에 차트 라이브러리로 구현 */}
            <div className="chart-placeholder">
              차트 영역
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

