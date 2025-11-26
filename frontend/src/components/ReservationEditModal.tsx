import { useState, useEffect } from 'react'
import './ReservationEditModal.css'
import { Reservation } from '../api/reservation'

interface ReservationEditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation
  onUpdate: (reservation: Reservation) => void
}

function ReservationEditModal({ isOpen, onClose, reservation, onUpdate }: ReservationEditModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    numberOfGuests: '',
    reservationTime: ''
  })

  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        customerName: reservation.customerName,
        phoneNumber: reservation.phoneNumber,
        numberOfGuests: reservation.numberOfGuests.toString(),
        reservationTime: reservation.reservationTime.toISOString().substring(0, 16)
      })
    }
  }, [isOpen, reservation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.customerName && formData.phoneNumber && formData.numberOfGuests && formData.reservationTime) {
      onUpdate({
        ...reservation,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        numberOfGuests: parseInt(formData.numberOfGuests),
        reservationTime: new Date(formData.reservationTime)
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
            <label htmlFor="edit-customerName">고객명</label>
            <div className="input-wrapper">
              <input
                id="edit-customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="edit-phoneNumber">연락처</label>
            <div className="input-wrapper">
              <input
                id="edit-phoneNumber"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="edit-numberOfGuests">인원</label>
            <div className="input-wrapper">
              <input
                id="edit-numberOfGuests"
                name="numberOfGuests"
                type="number"
                min="1"
                value={formData.numberOfGuests}
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


