import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import logo from '../assets/logo1.png'
import { login, type LoginRequest } from '../api/client'
import SignupModal from '../components/SignupModal'
import ResetPasswordModal from '../components/ResetPasswordModal'

function Login() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const loginData: LoginRequest = { username: userId, password } // API에 맞게 키 변경 (username)
      
      const response = await login(loginData)
      
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('userId', response.userId)
        if (response.name) {
            localStorage.setItem('userName', response.name)
        }
        navigate('/dashboard')
      } else {
        throw new Error('토큰을 받아오지 못했습니다.')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
      console.error('로그인 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* 로고 이미지 */}
      <img src={logo} alt="KGUnibar Logo" className="login-logo" />

      {/* 로그인 폼 */}
      <div className="login-form">
        <form onSubmit={handleLogin}>
          {/* 아이디 입력 */}
          <div className="input-group">
            <label htmlFor="userId">아이디</label>
            <div className="input-wrapper">
              <input
                id="userId"
                type="text"
                placeholder="아이디를 입력해주세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="links">
          <button 
            type="button"
            className="link-button" 
            onClick={() => setIsResetPasswordModalOpen(true)}
          >
            비밀번호 재설정
          </button>
          <span className="separator">|</span>
          <button 
            type="button"
            className="link-button" 
            onClick={() => setIsSignupModalOpen(true)}
          >
            회원가입
          </button>
        </div>
      </div>

      {/* 회원가입 모달 */}
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />

      {/* 비밀번호 재설정 모달 */}
      <ResetPasswordModal 
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  )
}

export default Login
