## QR 코드 관리 기능 (MongoDB 연동)

### 1. 개요

- **역할**: 결제에 사용할 **QR 코드 이미지를 등록·저장·조회**하는 기능입니다.
- **데이터 저장 위치**: Docker 컨테이너로 실행 중인 **MongoDB 볼륨**에 저장됩니다.

---

### 2. 백엔드 구조

- **주요 기술 스택**
  - **Spring Boot 3**
  - **Spring Data MongoDB**
  - **MongoDB (Docker, `mongodb` 서비스)**  

#### 2.1 도메인 (`QrCode`)

- **클래스 위치**: `src/main/java/org/example/model/QrCode.java`
- **컬렉션 이름**: `qrcodes`
- **필드**
  - **`id`**: MongoDB ObjectId
  - **`ownerId`**: 계정 식별자 (현재는 `"1"`로 고정)
  - **`imageData`**: Base64 형식의 이미지 데이터 (`data:image/png;base64,...`)
  - **`createdAt`**: QR 코드가 저장된 시각

#### 2.2 리포지토리 (`QrCodeRepository`)

- **위치**: `src/main/java/org/example/repository/QrCodeRepository.java`
- **기능**
  - **`findTopByOwnerIdOrderByCreatedAtDesc(String ownerId)`**
    - 동일한 `ownerId` 에 대해 **가장 최근에 저장된 QR 코드 1건**을 조회합니다.

#### 2.3 서비스 (`QrCodeService`)

- **위치**: `src/main/java/org/example/service/QrCodeService.java`
- **주요 상수**
  - **`FIXED_OWNER_ID = "1"`**: 로그인 기능이 붙기 전까지 고정된 계정 ID
- **주요 메서드**
  - **`saveQrCode(String imageData)`**
    - 기존에 `ownerId = "1"` 인 QR 코드가 있으면 그 객체를 재사용하고,
    - 없으면 새 `QrCode` 객체를 생성합니다.
    - `ownerId = "1"`, `imageData`, `createdAt = LocalDateTime.now()` 를 세팅한 뒤 MongoDB에 저장합니다.
  - **`getLatestQrCode()`**
    - `ownerId = "1"` 에 대한 가장 최신 QR 코드를 조회합니다.
    - 없으면 `null` 을 반환합니다.

#### 2.4 컨트롤러 (`QrCodeController`)

- **위치**: `src/main/java/org/example/controller/QrCodeController.java`
- **기본 URL 프리픽스**: `/api/qrcode`

- **`GET /api/qrcode`**
  - **설명**: 현재 계정(`ownerId = "1"`)의 최신 QR 코드 정보를 조회합니다.
  - **응답**
    - QR 코드가 없는 경우: `204 No Content`
    - QR 코드가 있는 경우: `200 OK` + `QrCode` JSON

- **`POST /api/qrcode`**
  - **설명**: Base64 이미지 데이터를 업로드하여 QR 코드를 저장/갱신합니다.
  - **요청 바디 DTO**: `QrCodeRequest` (`src/main/java/org/example/dto/QrCodeRequest.java`)
    - 필드: **`imageData`** (필수, Base64 문자열)
  - **검증**
    - `imageData` 가 `null` 이거나 비어 있으면 `400 Bad Request` 반환
  - **정상 처리**
    - `QrCodeService.saveQrCode(imageData)` 호출
    - 저장된 `QrCode` 객체를 `200 OK` 로 반환

---

### 3. 프론트엔드 연동

- **주요 위치**
  - **API 클라이언트**: `frontend/src/api/qrCodeClient.ts`
  - **설정 페이지 (QR 탭)**: `frontend/src/pages/Setting.tsx`
  - **결제 모달**: `frontend/src/components/PaymentModal.tsx`

#### 3.1 API 클라이언트 (`qrCodeClient.ts`)

- **기본 API URL**
  - `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'`
- **함수**
  - **`fetchQrCode()`**
    - `GET {API_BASE_URL}/qrcode`
    - 응답이 `204` 이면 `null` 반환
    - 응답이 `200` 이면 `QrCode` 객체(JSON)를 반환
  - **`uploadQrCode(imageData: string)`**
    - `POST {API_BASE_URL}/qrcode` + `{ imageData }` JSON 전송
    - 성공 시 저장된 `QrCode` 객체를 반환
    - 실패(`!response.ok`) 시 `Error('QR 코드를 저장하지 못했습니다.')` 예외 발생

#### 3.2 설정 페이지 (`Setting.tsx`) – QR 코드 탭

- **탭 구조**: 테이블 수 / 메뉴 / **QR 코드**
- **상태 값**
  - `qrCodeImage: string | null`
  - `fileInputRef: useRef<HTMLInputElement | null>`
- **동작**
  - 컴포넌트 마운트 시 **`fetchQrCode()`** 로 서버에서 QR 코드 이미지를 조회
    - 데이터가 있으면 `qrCodeImage` 에 `imageData` 세팅
    - 없으면 `null` 로 두어 샘플 QR 코드 표시
  - “QR 코드 등록하기” 버튼 클릭 시 숨겨진 `<input type="file" />` 클릭
  - 파일 선택 시:
    - 이미지 파일 여부(`file.type.startsWith('image/')`) 체크
    - 파일 크기 5MB 초과 시 경고
    - `FileReader` 로 Base64 문자열 생성 후 **`uploadQrCode(base64)`** 호출
    - 서버 응답으로 받은 `saved.imageData` 를 `qrCodeImage` 에 반영
    - 실패 시 콘솔 로그 + `alert('QR 코드 업로드에 실패했습니다. ...')` 표시

#### 3.3 결제 모달 (`PaymentModal.tsx`)

- **역할**: 결제 모달에서 QR 코드를 보여줍니다.
- **동작**
  - 마운트 시 **`fetchQrCode()`** 호출
  - 서버에 QR 코드가 존재하면 `qrCodeImage` 로 표시
  - 없으면 기존처럼 “샘플 QR 코드” SVG 를 보여줍니다.
  - 더 이상 `localStorage('qrCodeImage')` 에 의존하지 않습니다.

---

### 4. 동작 시나리오

- **1단계 – QR 코드 등록**
  - 설정 페이지 → **QR 코드 탭** 이동
  - `QR 코드 등록하기` 버튼 클릭 → 이미지 파일 선택
  - 프론트가 Base64 문자열로 변환 후 `POST /api/qrcode` 호출
  - 백엔드가 MongoDB `qrcodes` 컬렉션에 저장 (`ownerId = "1"`)
  - 저장 성공 시, 응답으로 받은 `imageData` 로 미리보기 이미지 갱신

- **2단계 – 결제 화면에서 QR 코드 사용**
  - 주문 상세 페이지에서 결제 모달(`PaymentModal`)을 열면
  - `fetchQrCode()` 로 서버에서 최신 QR 코드를 재조회
  - 있으면 해당 이미지를, 없으면 샘플 QR 코드를 표시

- **3단계 – 계정 분리 (향후)**
  - 현재는 `ownerId = "1"` 로 고정되어 있지만,
  - 추후 로그인 기능이 구현되면 **로그인한 사용자의 `ownerId` 를 서비스 레이어에 주입**하여 계정별로 QR 코드를 분리할 수 있습니다.

---

### 5. 테스트 코드

- **서비스 테스트**: `src/test/java/org/example/service/QrCodeServiceTest.java`
  - **`saveQrCode_setsOwnerIdAndDefaults`**
    - `saveQrCode` 호출 시 `ownerId = "1"`, `imageData` 유지, `createdAt` 이 지정되는지 검증
  - **`getLatestQrCode_returnsNullWhenNotExists`**
    - 저장된 QR 코드가 없을 때 `null` 반환 검증
  - **`getLatestQrCode_returnsLatest`**
    - 가장 최근 QR 코드가 올바르게 반환되는지 검증
  - 각 테스트 종료 후 `@AfterEach` 에서 **`"통과: <@DisplayName>"`** 로그 출력

- **컨트롤러 WebMvc 테스트**: `src/test/java/org/example/controller/QrCodeControllerTest.java`
  - **`getQrCode_noContent`**
    - 서비스에서 `null` 을 반환하는 경우 `GET /api/qrcode` 가 `204 No Content` 반환
  - **`getQrCode_ok`**
    - QR 코드가 존재할 때 `200 OK` 와 함께 `id`, `ownerId`, `imageData` 가 기대값인지 검증
  - **`uploadQrCode_ok`**
    - 유효한 `imageData` 로 업로드 시 `200 OK` 와 저장된 QR 코드 정보 반환
  - **`uploadQrCode_badRequest`**
    - `imageData` 가 빈 문자열일 때 `400 Bad Request` 반환 및 `QrCodeService` 미호출 검증
  - 마찬가지로 `@AfterEach` 에서 `"통과: <@DisplayName>"` 로그 출력

- **로컬에서 QR 기능 테스트 실행 방법**
  - 전체 QR 관련 테스트만 실행:
    ```bash
    ./gradlew test --tests "*QrCode*Test"
    ```

---

### 6. GitHub Actions 연동

- **워크플로우 파일**: `.github/workflows/qrcode-feature-test.yml`
- **트리거**
  - `push`: `main`, `develop`, `qr_feature` 브랜치
  - `pull_request`: `main`, `develop`, `qr_feature` 대상으로 생성된 PR
- **동작 내용**
  - JDK 17(temurin) 설정
  - `./gradlew test --tests "*QrCode*Test"` 실행
  - **QR 코드 관련 테스트(`QrCodeServiceTest`, `QrCodeControllerTest`)만 실행**하도록 제한

---


