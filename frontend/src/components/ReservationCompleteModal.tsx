import './ReservationCompleteModal.css'

interface ReservationCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function ReservationCompleteModal({ isOpen, onClose, onConfirm }: ReservationCompleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content complete-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">완료된 예약입니까?</h2>
        
        <div className="modal-buttons">
          <button type="button" className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button type="button" className="confirm-button" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationCompleteModal

