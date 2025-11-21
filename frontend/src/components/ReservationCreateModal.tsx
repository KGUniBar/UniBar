import { useState } from 'react'
import './ReservationCreateModal.css'

interface ReservationCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (reservation: { name: string; people: number; date: string }) => void
}

function ReservationCreateModal({ isOpen, onClose, onRegister }: ReservationCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    people: '',
    date: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.people && formData.date) {
      onRegister({
        name: formData.name,
        people: parseInt(formData.people),
        date: formData.date
      })
      // 폼 초기화
      setFormData({ name: '', people: '', date: '' })
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
            <label htmlFor="name">예약자명</label>
            <div className="input-wrapper">
              <input
                id="name"
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
            <label htmlFor="people">인원수</label>
            <div className="input-wrapper">
              <input
                id="people"
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
            <label htmlFor="date">예약일</label>
            <div className="input-wrapper">
              <input
                id="date"
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

export default ReservationCreateModal

