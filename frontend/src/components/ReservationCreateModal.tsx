import { useState } from 'react'
import './ReservationCreateModal.css'
import { Reservation } from '../api/client'

interface ReservationCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (reservation: Omit<Reservation, 'id' | 'status'>) => void
}

function ReservationCreateModal({ isOpen, onClose, onRegister }: ReservationCreateModalProps) {
  const [formData, setFormData] = useState({
    tableNumber: '',
    reservationTime: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.tableNumber && formData.reservationTime) {
      onRegister({
        tableNumber: parseInt(formData.tableNumber),
        reservationTime: new Date(formData.reservationTime).toISOString()
      })
      setFormData({ tableNumber: '', reservationTime: '' })
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
          <div className="input-group">
            <label htmlFor="tableNumber">테이블 번호</label>
            <div className="input-wrapper">
              <input
                id="tableNumber"
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
            <label htmlFor="reservationTime">예약 시간</label>
            <div className="input-wrapper">
              <input
                id="reservationTime"
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
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationCreateModal

