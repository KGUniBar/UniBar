import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ReservationCreateModal from '../components/ReservationCreateModal'
import ReservationEditModal from '../components/ReservationEditModal'
import ReservationCompleteModal from '../components/ReservationCompleteModal'
import { getReservations, createReservation, updateReservation, deleteReservation, Reservation } from '../api/client'
import './Reservation.css'

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const fetchReservations = async () => {
    try {
      const data = await getReservations()
      setReservations(data)
    } catch (error) {
      console.error(error)
      // TODO: 사용자에게 오류 메시지 표시
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const getCurrentDate = () => {
    const today = new new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[today.getDay()]
    return `${year}.${month}.${day} (${weekday})`
  }

  const handleCreateReservation = async (reservation: Omit<Reservation, 'id' | 'status'>) => {
    try {
      await createReservation({ ...reservation, status: 'PENDING' })
      fetchReservations()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsEditModalOpen(true)
  }

  const handleEditReservation = async (updatedReservation: Reservation) => {
    try {
      await updateReservation(updatedReservation.id, updatedReservation)
      fetchReservations()
      setIsEditModalOpen(false)
      setSelectedReservation(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCompleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCompleteModalOpen(true)
  }

  const handleCompleteConfirm = async () => {
    if (selectedReservation) {
      try {
        await updateReservation(selectedReservation.id, { ...selectedReservation, status: 'COMPLETED' })
        fetchReservations()
        setIsCompleteModalOpen(false)
        setSelectedReservation(null)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      try {
        await deleteReservation(id)
        fetchReservations()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="reservation-container">
      <Sidebar />
      <div className="main-content">
        <div className="top-header">
          <div className="header-date">{getCurrentDate()}</div>
          <div className="header-greeting">000님 안녕하세요 :)</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

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

          <div className="reservation-table-container">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>테이블 번호</th>
                  <th>예약 시간</th>
                  <th>상태</th>
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
                      <td>{reservation.tableNumber}</td>
                      <td>{formatDate(reservation.reservationTime)}</td>
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
                            onClick={() => handleDeleteClick(reservation.id)}
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

      <ReservationCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRegister={handleCreateReservation}
      />

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
