import { useState } from 'react'
import './SignupModal.css'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    userId: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 회원가입 로직 구현
    console.log('회원가입 시도:', formData)
    // TODO: API 호출
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content signup-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">회원가입</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 이름 */}
          <div className="input-group">
            <label htmlFor="name">이름</label>
            <div className="input-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div className="input-group">
            <label htmlFor="phone">전화번호</label>
            <div className="input-wrapper">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 아이디 */}
          <div className="input-group">
            <label htmlFor="signupUserId">아이디</label>
            <div className="input-wrapper">
              <input
                id="signupUserId"
                name="userId"
                type="text"
                value={formData.userId}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <label htmlFor="signupPassword">비밀번호</label>
            <div className="input-wrapper">
              <input
                id="signupPassword"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
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
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupModal

