import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ReservationCreateModal from '../components/ReservationCreateModal'
import ReservationEditModal from '../components/ReservationEditModal'
import ReservationCompleteModal from '../components/ReservationCompleteModal'
import './Reservation.css'
import {
  Reservation,
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../api/reservation'

interface User {
  id: string
  userId: string
  name?: string
}

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const handleError = (error: any) => {
    let message = '오류가 발생했습니다. 다시 시도해주세요.';
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      message = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
    } else if (error.message) {
      message = error.message;
    }
    console.error(error)
    setError(message)
    alert(message)
  }

  const fetchReservations = async () => {
    try {
      const data = await getReservations()
      setReservations(data)
    } catch (error) {
      handleError(error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchReservations()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

  const handleCreateReservation = async (reservation: Omit<Reservation, 'id' | 'reservationId' | 'createdAt' | 'status'>) => {
    try {
      await createReservation(reservation)
      fetchReservations()
      setIsCreateModalOpen(false)
    } catch (error) {
      handleError(error)
    }
  }

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsEditModalOpen(true)
  }

  const handleEditReservation = async (updatedReservation: Reservation) => {
    if (!updatedReservation.id) return
    try {
      await updateReservation(updatedReservation.id, updatedReservation)
      fetchReservations()
      setIsEditModalOpen(false)
      setSelectedReservation(null)
    } catch (error) {
      handleError(error)
    }
  }

  const handleCompleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCompleteModalOpen(true)
  }

  const handleCompleteConfirm = async () => {
    if (selectedReservation && selectedReservation.id) {
      try {
        await updateReservation(selectedReservation.id, { ...selectedReservation, status: 'completed' })
        fetchReservations()
        setIsCompleteModalOpen(false)
        setSelectedReservation(null)
      } catch (error) {
        handleError(error)
      }
    }
  }

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      try {
        await deleteReservation(id)
        fetchReservations()
      } catch (error) {
        handleError(error)
      }
    }
  }

  const formatDate = (date: Date) => {
    if (!date) return ''
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const activeReservations = reservations.filter(
    (reservation) => reservation.status !== 'completed'
  );

  return (
    <div className="reservation-container">
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
                  <th>고객명</th>
                  <th>연락처</th>
                  <th>예약 시간</th>
                  <th>인원</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activeReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-table-message">
                      등록된 예약이 없습니다.
                    </td>
                  </tr>
                ) : (
                  activeReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{reservation.customerName}</td>
                      <td>{reservation.phoneNumber}</td>
                      <td>{formatDate(reservation.reservationTime)}</td>
                      <td>{reservation.numberOfGuests}</td>
                      <td>{reservation.status}</td>
                      <td>
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
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteClick(reservation.id!)}
                          >
                            삭제
                          </button>
                        </div>
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

export default ReservationPage
