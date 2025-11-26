import { useState, useEffect } from 'react'
import './ReservationEditModal.css'
import { Reservation } from '../api/client'

interface ReservationEditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation
  onUpdate: (reservation: Reservation) => void
}

function ReservationEditModal({ isOpen, onClose, reservation, onUpdate }: ReservationEditModalProps) {
  const [formData, setFormData] = useState({
    tableNumber: '',
    reservationTime: ''
  })

  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        tableNumber: reservation.tableNumber.toString(),
        reservationTime: new Date(reservation.reservationTime).toISOString().substring(0, 16)
      })
    }
  }, [isOpen, reservation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.tableNumber && formData.reservationTime) {
      onUpdate({
        ...reservation,
        tableNumber: parseInt(formData.tableNumber),
        reservationTime: new Date(formData.reservationTime).toISOString()
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
          <div className="input-group">
            <label htmlFor="edit-tableNumber">테이블 번호</label>
            <div className="input-wrapper">
              <input
                id="edit-tableNumber"
                name="tableNumber"
                type="number"
                min="1"
                value={formData.tableNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="edit-reservationTime">예약 시간</label>
            <div className="input-wrapper">
              <input
                id="edit-reservationTime"
                name="reservationTime"
                type="datetime-local"
                value={formData.reservationTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="submit-button">
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationEditModal

