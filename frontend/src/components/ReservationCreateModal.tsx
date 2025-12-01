import { useState } from 'react'
import './ReservationCreateModal.css'
import { Reservation } from '../api/reservation'

interface ReservationCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (reservation: Omit<Reservation, 'id' | 'reservationId' | 'createdAt' | 'status'>) => void
}

function ReservationCreateModal({ isOpen, onClose, onRegister }: ReservationCreateModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    numberOfGuests: '',
    reservationTime: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.customerName && formData.phoneNumber && formData.numberOfGuests && formData.reservationTime) {
      onRegister({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        numberOfGuests: parseInt(formData.numberOfGuests),
        reservationTime: new Date(formData.reservationTime)
      })
      setFormData({ customerName: '', phoneNumber: '', numberOfGuests: '', reservationTime: '' })
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
        <h2 className="modal-title">예약 등록</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 예약자명 */}
          <div className="input-group">
            <label htmlFor="customerName">고객명</label>
            <div className="input-wrapper">
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="phoneNumber">연락처</label>
            <div className="input-wrapper">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="numberOfGuests">인원</label>
            <div className="input-wrapper">
              <input
                id="numberOfGuests"
                name="numberOfGuests"
                type="number"
                min="1"
                value={formData.numberOfGuests}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 예약일 */}
          <div className="input-group">
            <label htmlFor="date">예약일</label>
            <div className="input-wrapper">
              <input
                id="date"
                name="reservationTime"
                type="date"
                value={formData.reservationTime}
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

export default ReservationCreateModal
