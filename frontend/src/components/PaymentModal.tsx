import './PaymentModal.css'

interface PaymentModalProps {
  onClose: () => void
  onPaymentComplete: () => void
  totalPrice: number
}

function PaymentModal({ onClose, onPaymentComplete, totalPrice }: PaymentModalProps) {
  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="payment-modal-title">주문 및 결제하기</h2>
        
        <div className="payment-qr-code">
          {/* QR 코드 영역 */}
        </div>

        <div className="payment-modal-buttons">
          <button className="payment-button cancel" onClick={onClose}>
            취소
          </button>
          <button className="payment-button complete" onClick={onPaymentComplete}>
            결제완료
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal

