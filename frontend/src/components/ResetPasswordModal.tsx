import { useState } from 'react'
import './ResetPasswordModal.css'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 비밀번호 재설정 로직 구현
    console.log('비밀번호 재설정 시도:', formData)
    // TODO: API 호출
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
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="submit-button">
              재설정
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordModal

