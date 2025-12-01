# UniBar 백엔드 통합 README

## 1. 인증 (Auth)

- **주요 기능**
  - **회원가입**: 사용자 정보 저장, 비밀번호 BCrypt 암호화
  - **로그인**: `username/password` 검증 후 JWT 발급
  - **비밀번호 재설정**: 현재 비밀번호 검증 후 새 비밀번호로 변경
  - **JWT 필터**: 모든 보호된 API 요청에 대해 `Authorization: Bearer <token>` 검사

- **백엔드 구조**
  - `User` 엔티티 (`src/main/java/org/example/model/User.java`)
  - `AuthDto` (`LoginRequest`, `LoginResponse`, `SignupRequest`, `PasswordResetRequest`)
  - `AuthService` (`signup`, `login`, `resetPassword`)
    - 로그인/비밀번호 재설정 실패 시: 항상 `UnauthorizedException("아이디 또는 비밀번호가 일치하지 않습니다.")`
  - `AuthController` (`/api/auth/signup`, `/api/auth/login`, `/api/auth/reset-password`)
  - `SecurityConfig`
    - `/api/auth/**`, `/` 만 `permitAll`
    - 그 외 `/api/**` 는 모두 인증 필요

- **프론트 연동**
  - `frontend/src/api/client.ts`
    - `login`, `signup`, `resetPassword`, `logout`
    - 공통 헤더 `jsonHeaders`, 공통 에러 파서 `parseError`
  - 성공 시:
    - `token`, `userId`, `name` 을 `localStorage` 에 저장 (`Login.tsx`)

- **테스트 & CI**
  - 서비스 테스트: `AuthServiceTest`
  - 컨트롤러 WebMvc 테스트: `AuthControllerTest`
  - GitHub Actions: `.github/workflows/auth-test.yml`

---

## 2. 메뉴 관리 (Menu)

- **주요 기능**
  - 메뉴 **등록 / 조회 / 수정 / 삭제**
  - 데이터는 **MongoDB `menus` 컬렉션**에 저장
  - 로그인된 사용자별(`ownerId`)로 메뉴가 분리되어 관리

- **백엔드 구조**
  - `Menu` 엔티티: `id`, `ownerId`, `menuId`, `name`, `price`, `createdAt`
  - `MenuRepository`
    - `findByOwnerIdOrderByCreatedAtAsc(String ownerId)`
    - `findByIdAndOwnerId(String id, String ownerId)`
  - `MenuService`
    - `SecurityUtil.getCurrentUserId()` 로 ownerId 조회
    - `createMenu` 시 `ownerId`, `menuId(System.currentTimeMillis)`, `createdAt` 자동 세팅
    - `updateMenu`, `deleteMenu` 시 `id + ownerId` 로 조회, 없으면 `ResourceNotFoundException("메뉴를 찾을 수 없습니다.")`
  - `MenuController` (`/api/menus`)
    - `GET /api/menus`
    - `POST /api/menus`
    - `PUT /api/menus/{id}`
    - `DELETE /api/menus/{id}`

- **프론트 연동**
  - `frontend/src/api/menuClient.ts`
    - 공통 `authHeaders()` 로 JWT 헤더 추가
    - 모든 메서드에서 `parseError` 로 서버 에러 메시지 처리
  - `frontend/src/pages/Setting.tsx`
    - **메뉴 탭**에서 메뉴 목록 조회/등록/수정/삭제 UI 제공

- **테스트 & CI**
  - 서비스 테스트: `MenuServiceTest`
  - 컨트롤러 테스트: `MenuControllerTest`
    - `@WebMvcTest(controllers = MenuController.class, excludeFilters = {SecurityConfig, JwtAuthenticationFilter})`
    - `@WithMockUser`, `.with(csrf())` 로 시큐리티 환경 하에서 테스트
  - GitHub Actions: `.github/workflows/menu-feature-test.yml`  
    - `./gradlew test --tests "*Menu*Test"`

---

## 3. 주문 관리 (Order)

- **주요 기능**
  - **주문 생성**: 테이블별 주문 생성
  - **테이블별 미결제 주문 조회**
  - **전체 주문 조회 (매출/통계용)**
  - **결제 처리 (`isPaid = true`)**
  - **주방 잔여 주문 조회 (`isPaid = true` & `isCompleted = false`)**
  - **조리 완료 처리 (`isCompleted = true`)**
  - 모든 주문은 `ownerId` 로 **철저히 데이터 격리**

- **백엔드 구조**
  - `Order`, `OrderItem` 엔티티 (`orders` 컬렉션)
  - `OrderRepository`
    - `findByOwnerIdAndTableIdAndIsPaidFalse(...)`
    - `findByOwnerIdOrderByCreatedAtDesc(...)`
    - `findByOwnerIdAndIsCompletedFalseAndIsPaidTrue(...)`
  - `OrderService`
    - `createOrder`: ownerId 설정 + `orderId`(타임스탬프) + `isPaid=false`, `isCompleted=false`, `createdAt` 세팅
    - `getOrdersByTableId`
    - `payOrder`: ownerId 검증 후 `isPaid=true`, 없거나 다른 점주면 404/401
    - `getRemainingOrders`: 결제 완료 + 조리 미완료 주문
    - `completeOrder`: ownerId 검증 후 `isCompleted=true`
    - `getAllOrders`: ownerId 기준 최신순 전체 주문
  - `OrderController` (`/api/orders`)
    - `POST /api/orders`
    - `GET /api/orders/table/{tableId}`
    - `GET /api/orders`
    - `POST /api/orders/{id}/pay`
    - `GET /api/orders/remaining`
    - `POST /api/orders/{id}/complete`

- **프론트 연동 (주요 페이지)**
  - `frontend/src/api/orderClient.ts`
    - `createOrder`, `payOrder`, `getAllOrders`, `getTableOrders`, `getRemainingOrders`, `completeOrder`
  - `OrderDetail.tsx`
    - 테이블별 주문 생성/결제
    - 결제 시 `createOrder` → `payOrder` 로 MongoDB에 저장 후, 로컬 테이블 캐시만 초기화
  - `OrderList.tsx`
    - `getRemainingOrders()` 결과를 테이블별로 묶어 “홀 주문” 카드에 표시
  - `RemainingOrders.tsx`
    - 주방 화면: `getRemainingOrders()` + `completeOrder(id)`
  - `AllOrders.tsx`, `Dashboard.tsx`
    - `getAllOrders()` 로 이력/매출 통계 계산

- **테스트 & CI**
  - 서비스 테스트: `OrderServiceTest`
  - 컨트롤러 테스트: `OrderControllerTest`  
    - 메뉴/인증과 동일한 시큐리티 설정 패턴
  - GitHub Actions: `.github/workflows/order-feature-test.yml`
    - 현재는 전체 `./gradlew test` 를 실행 (필요 시 `--tests "*Order*Test"` 로 제한 가능)

---

## 4. QR 코드 관리 (QR Code)

- **주요 기능**
  - 점주별 결제용 **QR 코드 이미지 업로드/저장/조회**
  - `imageData` 는 Base64 (`data:image/png;base64,...`) 문자열로 저장
  - `ownerId` 기준으로 계정별 QR 코드 분리

- **백엔드 구조**
  - `QrCode` 엔티티 (`qrcodes` 컬렉션)
    - `id`, `ownerId`, `imageData`, `createdAt`
  - `QrCodeRepository`
    - `findTopByOwnerIdOrderByCreatedAtDesc(String ownerId)`
  - `QrCodeService`
    - `SecurityUtil.getCurrentUserId()` 로 ownerId 조회
    - `saveQrCode(imageData)`: 최신 QR 코드 갱신 또는 새로 생성 후 저장
    - `getLatestQrCode()`: 현재 사용자에 대한 최신 QR 코드 조회
  - `QrCodeController` (`/api/qrcode`)
    - `GET /api/qrcode`: QR 코드 없으면 204, 있으면 200 + JSON
    - `POST /api/qrcode`: `{"imageData": "..."}` 업로드, 비어 있으면 400

- **프론트 연동**
  - `frontend/src/api/qrCodeClient.ts`
    - 메뉴/주문과 동일한 `authHeaders` + `parseError` 패턴
    - `fetchQrCode()`, `uploadQrCode(imageData)`
  - `Setting.tsx` (QR 탭)
    - QR 코드 미리보기 + 이미지 업로드
  - `PaymentModal.tsx`
    - 결제 모달에서 최신 QR 코드 이미지 표시

- **테스트 & CI**
  - 서비스 테스트: `QrCodeServiceTest`
    - `SecurityUtil` 모킹 후 ownerId/createdAt 설정 검증
  - 컨트롤러 테스트: `QrCodeControllerTest`
    - `@WebMvcTest` + 시큐리티 설정 제외 + `@WithMockUser` + `.with(csrf())`
  - GitHub Actions: `.github/workflows/qrcode-feature-test.yml`
    - `./gradlew test --tests "*QrCode*Test"`

---

## 5. 공통 예외 처리 & 에러 응답

- `GlobalExceptionHandler`
  - `ResourceNotFoundException` → 404
  - `BadRequestException` → 400
  - `ConflictException` → 409
  - `UnauthorizedException` / `AuthenticationException` → 401
  - `AccessDeniedException` → 403
  - 기타 예외 → 500 `"서버 내부 오류가 발생했습니다."`
- 프론트는 `parseError` 로 `response.text()` / `response.json().message` 를 읽어  
  사용자에게 **한국어 에러 메시지를 그대로 표시**합니다.

---

## 6. DB 설계 (Database Schema)

### Database: MongoDB
모든 데이터는 **MongoDB**에 저장되며, 논리적인 데이터 격리는 `ownerId` (사용자 ID)를 기준으로 이루어집니다.

### 1. Users (사용자)
* **Collection**: `users`
* **Description**: 서비스 회원 가입 사용자 정보
* **Fields**:
    * `_id`: ObjectId (PK)
    * `username`: String (Unique, 로그인 아이디)
    * `password`: String (BCrypt Encrypted)
    * `name`: String (사용자 이름)
    * `phoneNumber`: String (연락처)
    * `createdAt`: Date (가입일)

### 2. Menus (메뉴)
* **Collection**: `menus`
* **Description**: 점주별 등록한 메뉴 정보
* **Fields**:
    * `_id`: ObjectId (PK)
    * `ownerId`: String (Index, 소유자 ID)
    * `menuId`: Long (메뉴 고유 식별자, Timestamp 기반)
    * `name`: String (메뉴명)
    * `price`: Long (가격)
    * `createdAt`: Date (등록일)

### 3. Orders (주문)
* **Collection**: `orders`
* **Description**: 테이블별 주문 및 결제 내역
* **Fields**:
    * `_id`: String (PK, UUID)
    * `ownerId`: String (Index, 소유자 ID)
    * `orderId`: Long (주문 번호)
    * `tableId`: Integer (테이블 번호)
    * `tableName`: String (테이블명)
    * `items`: Array[Object] (주문 항목 리스트)
        * `menuId`: Long
        * `menuName`: String
        * `price`: Long
        * `quantity`: Integer
    * `totalPrice`: Long (총 주문 금액)
    * `isPaid`: Boolean (결제 여부, `true`: 결제완료, `false`: 미결제)
    * `isCompleted`: Boolean (조리/서빙 완료 여부)
    * `orderDate`: String (주문 날짜 `YYYY-MM-DD`)
    * `createdAt`: Date (주문 생성 시간)

### 4. Reservations (예약)
* **Collection**: `reservations`
* **Description**: 홀 예약 정보
* **Fields**:
    * `_id`: String (PK)
    * `ownerId`: String (Index, 소유자 ID)
    * `reservationId`: Long (예약 번호)
    * `customerName`: String (예약자명)
    * `phoneNumber`: String (연락처)
    * `reservationTime`: Date (예약 시간)
    * `numberOfGuests`: Integer (인원 수)
    * `status`: String (상태: `confirmed`, `cancelled`, `completed`)
    * `createdAt`: Date (예약 생성 시간)

### 5. QrCodes (QR 코드)
* **Collection**: `qrcodes`
* **Description**: 점주별 결제용 QR 코드 이미지
* **Fields**:
    * `_id`: String (PK)
    * `ownerId`: String (Index, 소유자 ID)
    * `imageData`: String (Base64 Encoded Image Data)
    * `createdAt`: Date (등록일)

---

## 7. CI / GitHub Actions 요약

- **백엔드 통합 CI**: `.github/workflows/backend-ci.yml`
  - `main`, `develop` 브랜치에서 전체 `./gradlew build` 실행
  - MongoDB 서비스 컨테이너 포함
- **기능별 테스트 워크플로우**
  - `auth-test.yml`: 인증 서비스/컨트롤러 테스트
  - `menu-feature-test.yml`: 메뉴 관련 테스트만
  - `order-feature-test.yml`: 주문 관련 테스트 (현재 전체 test 실행)
  - `qrcode-feature-test.yml`: QR 코드 관련 테스트만

---

## 8. 로컬 실행 & 테스트

- **백엔드**
  - 로컬에서 MongoDB 가 필요하며, Docker Compose 사용 시:
    ```bash
    docker-compose up -d
    ```
- **테스트 예시**
  - 전체 테스트: `./gradlew test`
  - 특정 도메인만:
    - 인증: `./gradlew test --tests "*Auth*Test"`
    - 메뉴: `./gradlew test --tests "*Menu*Test"`
    - 주문: `./gradlew test --tests "*Order*Test"`
    - QR 코드: `./gradlew test --tests "*QrCode*Test"`