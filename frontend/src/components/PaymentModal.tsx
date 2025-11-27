import { useState, useEffect } from 'react'
import { fetchQrCode } from '../api/qrCodeClient'
import './PaymentModal.css'

interface PaymentModalProps {
  onClose: () => void
  onPaymentComplete: () => void
  totalPrice: number
}

function PaymentModal({ onClose, onPaymentComplete, totalPrice }: PaymentModalProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // 서버에서 QR 코드 이미지 불러오기
  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const data = await fetchQrCode()
        if (data) {
          setQrCodeImage(data.imageData)
        } else {
          setQrCodeImage(null)
        }
      } catch (error) {
        console.error('QR 코드 불러오기 실패:', error)
      }
    }

    loadQrCode()
  }, [])

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="payment-modal-title">주문 및 결제하기</h2>
        
        <div className="payment-qr-code">
          {qrCodeImage ? (
            <img src={qrCodeImage} alt="QR Code" className="payment-qr-code-image" />
          ) : (
            <div className="payment-qr-code-sample">
              <div className="payment-qr-code-sample-text">샘플 QR 코드</div>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#f0f0f0"/>
                <rect x="20" y="20" width="40" height="40" fill="#000"/>
                <rect x="80" y="20" width="20" height="20" fill="#000"/>
                <rect x="120" y="20" width="40" height="40" fill="#000"/>
                <rect x="20" y="80" width="20" height="20" fill="#000"/>
                <rect x="60" y="80" width="20" height="20" fill="#000"/>
                <rect x="100" y="80" width="20" height="20" fill="#000"/>
                <rect x="140" y="80" width="20" height="20" fill="#000"/>
                <rect x="20" y="120" width="40" height="40" fill="#000"/>
                <rect x="80" y="140" width="20" height="20" fill="#000"/>
                <rect x="120" y="120" width="40" height="40" fill="#000"/>
              </svg>
            </div>
          )}
        </div>

        <div className="payment-modal-buttons">
          <button className="payment-button cancel" onClick={onClose}>
            취소
          </button>
          <button className="payment-button complete" onClick={() => setIsConfirmModalOpen(true)}>
            결제완료
          </button>
        </div>
      </div>

      {/* 결제 확인 팝업 */}
      {isConfirmModalOpen && (
        <div className="confirm-modal-overlay" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">결제 확인</h2>
            <p className="confirm-modal-message">
              정말 {totalPrice.toLocaleString()}원 결제가 완료되었습니까?
            </p>
            <div className="confirm-modal-buttons">
              <button className="confirm-button cancel" onClick={() => setIsConfirmModalOpen(false)}>
                취소
              </button>
              <button 
                className="confirm-button confirm" 
                onClick={() => {
                  setIsConfirmModalOpen(false)
                  onPaymentComplete()
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentModal

