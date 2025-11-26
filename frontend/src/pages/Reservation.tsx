import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ReservationCreateModal from '../components/ReservationCreateModal'
import ReservationEditModal from '../components/ReservationEditModal'
import ReservationCompleteModal from '../components/ReservationCompleteModal'
import './Reservation.css'

interface Reservation {
  id: number
  name: string
  people: number
  date: string
}

function Reservation() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

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

  const handleCreateReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now() // 임시 ID 생성
    }
    setReservations([...reservations, newReservation])
    setIsCreateModalOpen(false)
  }

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsEditModalOpen(true)
  }

  const handleEditReservation = (updatedReservation: Reservation) => {
    setReservations(reservations.map(r => 
      r.id === updatedReservation.id ? updatedReservation : r
    ))
    setIsEditModalOpen(false)
    setSelectedReservation(null)
  }

  const handleCompleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCompleteModalOpen(true)
  }

  const handleCompleteConfirm = () => {
    if (selectedReservation) {
      setReservations(reservations.filter(r => r.id !== selectedReservation.id))
      setIsCompleteModalOpen(false)
      setSelectedReservation(null)
    }
  }

  const hasValidData = (reservation: Reservation) => {
    return reservation.name && reservation.people > 0 && reservation.date
  }

  // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return dateString.replace(/-/g, '.')
  }

  return (
    <div className="reservation-container">
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

        {/* 예약 목록 컨텐츠 */}
        <div className="reservation-content">
          <div className="reservation-header">
            <h1 className="reservation-title">홀 예약</h1>
            <button 
              className="reservation-register-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              예약 등록
            </button>
          </div>

          {/* 예약 목록 테이블 */}
          <div className="reservation-table-container">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>예약자명</th>
                  <th>인원수</th>
                  <th>예약일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-table-message">
                      등록된 예약이 없습니다.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.name}</td>
                      <td>{reservation.people}</td>
                      <td>{formatDate(reservation.date)}</td>
                      <td>
                        {hasValidData(reservation) && (
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEditClick(reservation)}
                            >
                              수정
                            </button>
                            <button
                              className="complete-button"
                              onClick={() => handleCompleteClick(reservation)}
                            >
                              완료
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 예약 등록 모달 */}
      <ReservationCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRegister={handleCreateReservation}
      />

      {/* 예약 수정 모달 */}
      {selectedReservation && (
        <ReservationEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedReservation(null)
          }}
          reservation={selectedReservation}
          onUpdate={handleEditReservation}
        />
      )}

      {/* 완료 확인 모달 */}
      <ReservationCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false)
          setSelectedReservation(null)
        }}
        onConfirm={handleCompleteConfirm}
      />
    </div>
  )
}

export default Reservation

