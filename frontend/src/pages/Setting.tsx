import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { fetchQrCode, uploadQrCode } from '../api/qrCodeClient'
import { fetchMenus, createMenu as createMenuApi, updateMenu as updateMenuApi, deleteMenu as deleteMenuApi, type Menu as ApiMenu } from '../api/menuClient'
import './Setting.css'

type SettingTab = 'table' | 'menu' | 'qrcode'

interface Menu {
  id: string
  name: string
  price: number
}

function Setting() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingTab>('table')
  const [tableCount, setTableCount] = useState<number>(8)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  
  // 메뉴 관리 상태
  const [menus, setMenus] = useState<Menu[]>([])
  const [menuName, setMenuName] = useState<string>('')
  const [menuPrice, setMenuPrice] = useState<string>('')
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null)
  const [isMenuEditModalOpen, setIsMenuEditModalOpen] = useState(false)
  const [editMenuName, setEditMenuName] = useState<string>('')
  const [editMenuPrice, setEditMenuPrice] = useState<string>('')
  
  // QR 코드 관리 상태
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // localStorage에서 테이블 수 불러오기
  useEffect(() => {
    const savedTableCount = localStorage.getItem('tableCount')
    if (savedTableCount) {
      setTableCount(parseInt(savedTableCount, 10))
    }
  }, [])

  // 서버에서 메뉴 불러오기
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data: ApiMenu[] = await fetchMenus()
        // API에서 받은 데이터를 프론트엔드에서 사용하는 형태로 매핑
        const mapped: Menu[] = data.map(menu => ({
          id: menu.id ?? String(menu.menuId ?? ''),
          name: menu.name,
          price: menu.price,
        }))
        setMenus(mapped)
      } catch (error) {
        console.error('메뉴 불러오기 실패:', error)
        setMenus([])
      }
    }

    loadMenus()
  }, [])

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // 현재 날짜 포맷팅
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[today.getDay()]
    return `${year}.${month}.${day} (${weekday})`
  }

  const handleDecrease = () => {
    if (tableCount > 1) {
      setTableCount(tableCount - 1)
    }
  }

  const handleIncrease = () => {
    setTableCount(tableCount + 1)
  }

  const handleSave = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSave = () => {
    localStorage.setItem('tableCount', tableCount.toString())
    setIsConfirmModalOpen(false)
    // TODO: API 호출로 서버에 저장
  }

  const handleCancelSave = () => {
    setIsConfirmModalOpen(false)
  }

  // 메뉴 추가 (MongoDB 저장)
  const handleAddMenu = async () => {
    if (!menuName.trim() || !menuPrice.trim()) {
      alert('메뉴명과 금액을 모두 입력해주세요.')
      return
    }

    const price = parseInt(menuPrice.replace(/,/g, ''), 10)
    if (isNaN(price) || price <= 0) {
      alert('올바른 금액을 입력해주세요.')
      return
    }

    try {
      const created = await createMenuApi({
        name: menuName.trim(),
        price: price,
      })

      const newMenu: Menu = {
        id: created.id ?? String(created.menuId ?? ''),
        name: created.name,
        price: created.price,
      }

      const updatedMenus = [...menus, newMenu]
      setMenus(updatedMenus)
      
      setMenuName('')
      setMenuPrice('')
    } catch (error) {
      console.error('메뉴 등록 실패:', error)
      alert('메뉴 등록에 실패했습니다.')
    }
  }

  // 메뉴 수정 모달 열기
  const handleOpenEditModal = (menu: Menu) => {
    setEditingMenuId(menu.id)
    setEditMenuName(menu.name)
    setEditMenuPrice(menu.price.toLocaleString())
    setIsMenuEditModalOpen(true)
  }

  // 메뉴 수정 (MongoDB 반영)
  const handleEditMenu = async () => {
    if (!editMenuName.trim() || !editMenuPrice.trim()) {
      alert('메뉴명과 금액을 모두 입력해주세요.')
      return
    }

    const price = parseInt(editMenuPrice.replace(/,/g, ''), 10)
    if (isNaN(price) || price <= 0) {
      alert('올바른 금액을 입력해주세요.')
      return
    }

    if (editingMenuId === null) return

    try {
      const updated = await updateMenuApi(editingMenuId, {
        name: editMenuName.trim(),
        price: price,
      })

      const updatedMenus = menus.map(menu =>
        menu.id === editingMenuId
          ? { ...menu, name: updated.name, price: updated.price }
          : menu
      )
      setMenus(updatedMenus)
      
      setIsMenuEditModalOpen(false)
      setEditingMenuId(null)
      setEditMenuName('')
      setEditMenuPrice('')
    } catch (error) {
      console.error('메뉴 수정 실패:', error)
      alert('메뉴 수정에 실패했습니다.')
    }
  }

  // 메뉴 삭제 (MongoDB 반영)
  const handleDeleteMenu = async (menuId: string) => {
    if (!window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteMenuApi(menuId)
      const updatedMenus = menus.filter(menu => menu.id !== menuId)
      setMenus(updatedMenus)
    } catch (error) {
      console.error('메뉴 삭제 실패:', error)
      alert('메뉴 삭제에 실패했습니다.')
    }
  }

  // 금액 입력 포맷팅 (천단위 콤마)
  const handlePriceChange = (value: string, setter: (value: string) => void) => {
    const numericValue = value.replace(/,/g, '')
    if (numericValue === '' || /^\d+$/.test(numericValue)) {
      setter(numericValue === '' ? '' : parseInt(numericValue, 10).toLocaleString())
    }
  }

  // QR 코드 이미지 업로드
  const handleQrCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string
        const saved = await uploadQrCode(base64String)
        setQrCodeImage(saved.imageData)
      } catch (error) {
        console.error('QR 코드 업로드 실패:', error)
        alert('QR 코드 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }
    reader.readAsDataURL(file)
  }

  // QR 코드 등록 버튼 클릭
  const handleQrCodeRegisterClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="setting-container">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 상단 헤더 */}
        <div className="top-header">
          <div className="header-date">{getCurrentDate()}</div>
          <div className="header-greeting">{localStorage.getItem('userName') || '000'}님 안녕하세요 :)</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 세팅 컨텐츠 */}
        <div className="setting-content">
          <div className="setting-header">
            <h1 className="setting-title">Setting</h1>
            
            {/* 탭 버튼 */}
            <div className="setting-tabs">
              <button
                className={`setting-tab ${activeTab === 'table' ? 'active' : ''}`}
                onClick={() => setActiveTab('table')}
              >
                테이블 수
              </button>
              <button
                className={`setting-tab ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                메뉴
              </button>
              <button
                className={`setting-tab ${activeTab === 'qrcode' ? 'active' : ''}`}
                onClick={() => setActiveTab('qrcode')}
              >
                QR 코드
              </button>
            </div>
          </div>

          {/* 테이블 수량 화면 */}
          {activeTab === 'table' && (
            <div className="table-count-section">
              <div className="table-count-label">테이블 수량</div>
              <div className="table-count-controls">
                <button className="count-button" onClick={handleDecrease}>
                  -
                </button>
                <span className="count-value">{tableCount}</span>
                <button className="count-button" onClick={handleIncrease}>
                  +
                </button>
                <button className="save-button" onClick={handleSave}>
                  저장
                </button>
              </div>
            </div>
          )}

          {/* 메뉴 화면 */}
          {activeTab === 'menu' && (
            <div className="menu-section">
              {/* 메뉴 등록 버튼 */}
              <button className="menu-register-button" onClick={handleAddMenu}>
                메뉴 등록
              </button>

              {/* 메뉴 입력 폼 */}
              <div className="menu-input-form">
                <div className="menu-input-group">
                  <label className="menu-input-label">메뉴명</label>
                  <input
                    type="text"
                    className="menu-input"
                    placeholder="메뉴명을 입력하세요"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddMenu()
                      }
                    }}
                  />
                </div>
                <div className="menu-input-group">
                  <label className="menu-input-label">금액</label>
                  <input
                    type="text"
                    className="menu-input"
                    placeholder="금액을 입력하세요"
                    value={menuPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setMenuPrice)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddMenu()
                      }
                    }}
                  />
                </div>
              </div>

              {/* 메뉴 목록 테이블 */}
              <div className="menu-table-container">
                <table className="menu-table">
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>메뉴명</th>
                      <th>금액</th>
                      <th>설정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-menu-message">
                          등록된 메뉴가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      menus.map((menu, index) => (
                        <tr key={menu.id}>
                          <td>{index + 1}</td>
                          <td>{menu.name}</td>
                          <td>{menu.price.toLocaleString()}원</td>
                          <td>
                            <div className="menu-action-buttons">
                              <button
                                className="menu-action-btn delete"
                                onClick={() => handleDeleteMenu(menu.id)}
                              >
                                삭제
                              </button>
                              <button
                                className="menu-action-btn edit"
                                onClick={() => handleOpenEditModal(menu)}
                              >
                                수정
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QR 코드 화면 */}
          {activeTab === 'qrcode' && (
            <div className="qrcode-section">
              <div className="qrcode-controls">
                <button className="qrcode-register-button" onClick={handleQrCodeRegisterClick}>
                  QR 코드 등록하기
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeUpload}
                  style={{ display: 'none' }}
                />
                <div className="qrcode-preview">
                  {qrCodeImage ? (
                    <img src={qrCodeImage} alt="QR Code" className="qrcode-image" />
                  ) : (
                    <div className="qrcode-sample">
                      <div className="qrcode-sample-text">샘플 QR 코드</div>
                      <div className="qrcode-sample-placeholder">
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 테이블 수 확인 팝업 */}
      {isConfirmModalOpen && (
        <div className="confirm-modal-overlay" onClick={handleCancelSave}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">테이블 수 저장</h2>
            <p className="confirm-modal-message">
              테이블 수를 {tableCount}개로 저장하시겠습니까?
            </p>
            <div className="confirm-modal-buttons">
              <button className="confirm-button cancel" onClick={handleCancelSave}>
                취소
              </button>
              <button className="confirm-button confirm" onClick={handleConfirmSave}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 수정 팝업 */}
      {isMenuEditModalOpen && (
        <div className="confirm-modal-overlay" onClick={() => setIsMenuEditModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-modal-title">메뉴 수정하기</h2>
            <div className="menu-edit-form">
              <div className="menu-edit-input-group">
                <label className="menu-edit-label">메뉴명</label>
                <input
                  type="text"
                  className="menu-edit-input"
                  value={editMenuName}
                  onChange={(e) => setEditMenuName(e.target.value)}
                />
              </div>
              <div className="menu-edit-input-group">
                <label className="menu-edit-label">금액</label>
                <input
                  type="text"
                  className="menu-edit-input"
                  value={editMenuPrice}
                  onChange={(e) => handlePriceChange(e.target.value, setEditMenuPrice)}
                />
              </div>
            </div>
            <div className="confirm-modal-buttons">
              <button
                className="confirm-button cancel"
                onClick={() => setIsMenuEditModalOpen(false)}
              >
                취소
              </button>
              <button className="confirm-button confirm" onClick={handleEditMenu}>
                수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Setting

