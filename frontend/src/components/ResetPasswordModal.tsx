import { useState } from 'react'
import './ResetPasswordModal.css'
import { resetPassword, type PasswordResetRequest } from '../api/client'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 유효성 검사
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
        const requestData: PasswordResetRequest = {
            username: formData.userId,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        }

        await resetPassword(requestData)
        alert('비밀번호가 성공적으로 변경되었습니다.')
        onClose()
        
        // 초기화
        setFormData({
            userId: '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        })
    } catch (err) {
        setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
        setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reset-password-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">비밀번호 재설정</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 아이디 */}
          <div className="input-group">
            <label htmlFor="resetUserId">아이디</label>
            <div className="input-wrapper">
              <input
                id="resetUserId"
                name="userId"
                type="text"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 현재 비밀번호 */}
          <div className="input-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <div className="input-wrapper">
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 변경 비밀번호 */}
          <div className="input-group">
            <label htmlFor="newPassword">변경 비밀번호</label>
            <div className="input-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 변경 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="confirmNewPassword">변경 비밀번호 확인</label>
            <div className="input-wrapper">
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

          {/* 버튼 */}
          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isLoading}>
              취소
            </button>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? '처리 중...' : '재설정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordModal
