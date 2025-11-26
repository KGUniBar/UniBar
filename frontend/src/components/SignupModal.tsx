import { useState } from 'react'
import './SignupModal.css'
import { signup, type SignupRequest } from '../api/client'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    userId: '', // API에는 username으로 전송됨
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
        const requestData: SignupRequest = {
            username: formData.userId,
            password: formData.password,
            name: formData.name,
            phone: formData.phone
        }

        await signup(requestData)
        alert('회원가입이 완료되었습니다.')
        onClose()
        
        // 초기화
        setFormData({
            name: '',
            phone: '',
            userId: '',
            password: '',
            confirmPassword: ''
        })
    } catch (err) {
        setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
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
                required
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
                required
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
                required
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
                required
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
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupModal
