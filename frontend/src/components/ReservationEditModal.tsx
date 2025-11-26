import { useState, useEffect } from 'react'
import './ReservationEditModal.css'

interface Reservation {
  id: number
  name: string
  people: number
  date: string
}

interface ReservationEditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation
  onUpdate: (reservation: Reservation) => void
}

function ReservationEditModal({ isOpen, onClose, reservation, onUpdate }: ReservationEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    people: '',
    date: ''
  })

  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        name: reservation.name,
        people: reservation.people.toString(),
        date: reservation.date
      })
    }
  }, [isOpen, reservation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.people && formData.date) {
      onUpdate({
        ...reservation,
        name: formData.name,
        people: parseInt(formData.people),
        date: formData.date
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reservation-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">예약 수정</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 예약자명 */}
          <div className="input-group">
            <label htmlFor="edit-name">예약자명</label>
            <div className="input-wrapper">
              <input
                id="edit-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 인원수 */}
          <div className="input-group">
            <label htmlFor="edit-people">인원수</label>
            <div className="input-wrapper">
              <input
                id="edit-people"
                name="people"
                type="number"
                min="1"
                value={formData.people}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 예약일 */}
          <div className="input-group">
            <label htmlFor="edit-date">예약일</label>
            <div className="input-wrapper">
              <input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="submit-button">
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationEditModal

