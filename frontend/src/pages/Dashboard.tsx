import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'

interface Order {
  id: number
  tableId: number
  tableName: string
  items: any[]
  orderTime: string
  orderDate?: string
  totalPrice: number
}

function Dashboard() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<'yesterday' | 'today' | 'week'>('today')
  const [totalSales, setTotalSales] = useState<number>(0)
  const [totalOrderCount, setTotalOrderCount] = useState<number>(0)

  // 날짜 범위 계산 함수
  const getDateRange = (period: 'yesterday' | 'today' | 'week') => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (period) {
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case 'week':
        const weekStart = new Date(today)
        const dayOfWeek = weekStart.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일로 맞춤
        weekStart.setDate(weekStart.getDate() + diff)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return {
          start: weekStart,
          end: weekEnd
        }
      default:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
    }
  }

  // 기간별 통계 계산
  const calculatePeriodStats = (period: 'yesterday' | 'today' | 'week') => {
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]') as Order[]
    const { start, end } = getDateRange(period)
    
    // 주문 날짜가 있는 경우 날짜로 필터링, 없는 경우는 id(타임스탬프)로 필터링
    const filteredOrders = allOrders.filter(order => {
      let orderDate: Date
      
      if (order.orderDate) {
        // orderDate가 "YYYY-MM-DD" 형식인 경우
        const [year, month, day] = order.orderDate.split('-').map(Number)
        orderDate = new Date(year, month - 1, day)
      } else {
        // orderDate가 없는 경우 id(타임스탬프)로 판단
        orderDate = new Date(order.id)
        orderDate.setHours(0, 0, 0, 0)
      }
      
      return orderDate >= start && orderDate <= end
    })
    
    const sales = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const orderCount = filteredOrders.length
    
    return { sales, orderCount }
  }

  // localStorage에서 기간별 통계 불러오기
  useEffect(() => {
    const loadStats = () => {
      const stats = calculatePeriodStats(selectedPeriod)
      setTotalSales(stats.sales)
      setTotalOrderCount(stats.orderCount)
    }
    
    loadStats()
    
    // 통계가 변경될 때마다 업데이트
    const handleStorageChange = () => {
      loadStats()
    }

    window.addEventListener('storage', handleStorageChange)
    // 같은 탭에서 변경된 경우를 위해 interval로 체크
    const interval = setInterval(() => {
      loadStats()
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [selectedPeriod])

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

        {/* 대시보드 컨텐츠 */}
        <div className="dashboard-content">
          <h1 className="dashboard-title">대시보드</h1>

          {/* 날짜 필터 */}
          <div className="period-filter">
            <button
              className={`period-button ${selectedPeriod === 'yesterday' ? 'active' : 'inactive'}`}
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
              className={`period-button ${selectedPeriod === 'week' ? 'active' : 'inactive'}`}
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
                <span>{totalSales.toLocaleString()}</span>
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
                <span>{totalOrderCount.toLocaleString()}</span>
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

