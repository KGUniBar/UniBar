## 🍽 메뉴 기능 명세서 (Menu Feature)

### 1. 개요

`menu_feature` 브랜치에서는 **메뉴 등록/조회/수정/삭제 기능**을 백엔드 + 프론트엔드 전체 흐름으로 구현했습니다.  
메뉴 데이터는 **로컬스토리지(localStorage)가 아니라 Docker 컨테이너에서 동작 중인 MongoDB** 에 저장되며,  
현재는 로그인 기능이 없다고 가정하고 **`ownerId = "1"`** 으로 고정해서 점주별 데이터를 분리합니다.

---

### 2. 아키텍처 개요

- **Backend (Spring Boot, MongoDB 사용)**
  - `Menu` 도메인 모델 (`menus` 컬렉션)
  - `MenuRepository` (MongoRepository)
  - `MenuService` (비즈니스 로직, `ownerId = "1"` 고정)
  - `MenuController` (`/api/menus` REST API)

- **Frontend (React, TypeScript)**
  - 메뉴 API 클라이언트: `frontend/src/api/menuClient.ts`
  - 설정 페이지 메뉴 탭: `frontend/src/pages/Setting.tsx`
  - 메뉴 등록/수정/삭제 UI + API 연동

- **테스트 & CI**
  - 서비스 테스트: `MenuServiceTest`
  - 컨트롤러 테스트: `MenuControllerTest`
  - GitHub Actions 워크플로우: `.github/workflows/menu-feature-test.yml`  
    → 메뉴 관련 테스트만 선택 실행

---

### 3. 백엔드 구현

#### 3.1 Menu 도메인 모델

- 위치: `src/main/java/org/example/model/Menu.java`

- MongoDB 컬렉션: `menus`

- 필드:
  - `id: String`  
    - MongoDB ObjectId (자동 생성)
  - `ownerId: String`  
    - 점주 ID  
    - 현재는 로그인 기능 부재로 **항상 `"1"`** 로 저장
  - `menuId: Long`  
    - 프론트엔드용 타임스탬프 기반 ID (`System.currentTimeMillis()`)
  - `name: String`  
    - 메뉴명
  - `price: int`  
    - 메뉴 가격
  - `createdAt: LocalDateTime`  
    - 메뉴 등록 시각

#### 3.2 MenuRepository

- 위치: `src/main/java/org/example/repository/MenuRepository.java`

- 인터페이스:
  - `List<Menu> findByOwnerIdOrderByCreatedAtAsc(String ownerId);`
    - 특정 점주의 메뉴를 **생성 시각 오름차순**으로 조회
  - `Optional<Menu> findByIdAndOwnerId(String id, String ownerId);`
    - `id + ownerId` 기준으로 메뉴 단건 조회 (소유자 검증용)

#### 3.3 MenuService

- 위치: `src/main/java/org/example/service/MenuService.java`

- 상수:
  - `private static final String FIXED_OWNER_ID = "1";`
    - 로그인 기능이 구현되기 전까지는 **ownerId를 1로 고정**해서 사용

- 메서드:
  - `List<Menu> getMenus()`
    - `ownerId = "1"` 기준으로 메뉴 목록 조회, 로그인 구현 시 계정 id 사용
  - `Menu createMenu(Menu menu)`
    - 신규 메뉴 등록
    - 처리 내용:
      - `id = null` 로 초기화 → MongoDB가 ObjectId 생성
      - `ownerId = "1"`
      - `menuId = System.currentTimeMillis()`
      - `createdAt = LocalDateTime.now()`
      - `name`, `price` 는 요청값 그대로 사용
  - `Menu updateMenu(String id, Menu updated)`
    - `id + ownerId = "1"` 로 메뉴 조회 후, `name`, `price` 만 수정
  - `void deleteMenu(String id)`
    - `id + ownerId = "1"` 로 조회 후 해당 메뉴 삭제

#### 3.4 MenuController (REST API)

- 위치: `src/main/java/org/example/controller/MenuController.java`
- 베이스 URL: `/api/menus`

##### 3.4.1 메뉴 목록 조회

- `GET /api/menus`
- 설명: 현재 점주(`ownerId = "1"`)의 메뉴 목록을 조회
- 응답 예시:
  ```json
  [
    {
      "id": "665f1a9d9a8b3c4d5e6f7a81",
      "ownerId": "1",
      "menuId": 1719301234567,
      "name": "생맥주",
      "price": 5000,
      "createdAt": "2025-11-25T17:05:12.345"
    }
  ]
  ```

##### 3.4.2 메뉴 등록

- `POST /api/menus`
- 요청 Body:
  ```json
  {
    "name": "생맥주",
    "price": 5000
  }
  ```
- 서버 처리:
  - `ownerId` / `menuId` / `createdAt` 자동 세팅
- 응답 Body:
  ```json
  {
    "id": "665f1a9d9a8b3c4d5e6f7a81",
    "ownerId": "1",
    "menuId": 1719301234567,
    "name": "생맥주",
    "price": 5000,
    "createdAt": "2025-11-25T17:05:12.345"
  }
  ```

##### 3.4.3 메뉴 수정

- `PUT /api/menus/{id}`
- 요청 Body:
  ```json
  {
    "name": "생맥주 500cc",
    "price": 6000
  }
  ```
- 처리:
  - `{id} + ownerId = "1"` 인 메뉴만 수정 가능

##### 3.4.4 메뉴 삭제

- `DELETE /api/menus/{id}`
- 처리:
  - `{id} + ownerId = "1"` 인 메뉴만 삭제

---

### 4. 프론트엔드 연동

#### 4.1 메뉴 API 클라이언트

- 위치: `frontend/src/api/menuClient.ts`

- 타입:
  ```ts
  export interface Menu {
    id?: string
    menuId?: number
    name: string
    price: number
  }
  ```

- 함수:
  - `fetchMenus(): Promise<Menu[]>`
    - `GET /api/menus`
  - `createMenu(menu: { name: string; price: number }): Promise<Menu>`
    - `POST /api/menus`
  - `updateMenu(id: string, menu: { name: string; price: number }): Promise<Menu>`
    - `PUT /api/menus/{id}`
  - `deleteMenu(id: string): Promise<void>`
    - `DELETE /api/menus/{id}`

#### 4.2 Setting 페이지 메뉴 탭

- 위치: `frontend/src/pages/Setting.tsx`
- 관련 부분:
  - 상태:
    - `menus: Menu[]` : API에서 불러온 메뉴 목록
    - `menuName`, `menuPrice`: 신규 메뉴 입력값
    - `editingMenuId`, `editMenuName`, `editMenuPrice`: 수정 모달용 값
  - 초기 로딩:
    - `useEffect` 에서 `fetchMenus()` 호출 → MongoDB의 `menus` 컬렉션에서 목록 조회
  - 메뉴 등록:
    - 입력값 검증 (메뉴명/금액 필수, 금액 > 0)
    - `createMenuApi({ name, price })` 호출
    - 성공 시 `menus` 상태에 추가
  - 메뉴 수정:
    - 수정 모달에서 값 변경 후 `updateMenuApi(editingMenuId, { name, price })` 호출
    - 성공 시 해당 메뉴만 상태에서 갱신
  - 메뉴 삭제:
    - 확인 팝업 후 `deleteMenuApi(menuId)` 호출
    - 성공 시 상태에서 제거

---

### 5. 테스트 & GitHub Actions

#### 5.1 서비스 테스트 (`MenuServiceTest`)

- 위치: `src/test/java/org/example/service/MenuServiceTest.java`
- 검증 내용:
  - `createMenu` 호출 시:
    - `ownerId` 가 `"1"`로 세팅되는지
    - `menuId`, `createdAt` 이 자동으로 채워지는지
    - `name`, `price` 가 요청값과 일치하는지
    - `MenuRepository.save()` 가 호출되는지

#### 5.2 컨트롤러 테스트 (`MenuControllerTest`)

- 위치: `src/test/java/org/example/controller/MenuControllerTest.java`
- 검증 내용:
  - `POST /api/menus` 에 올바른 JSON Body를 보내면:
    - 200 OK 응답
    - 응답 JSON 에 `id`, `name`, `price` 필드가 기대값과 일치하는지

#### 5.3 GitHub Actions 워크플로우

- 위치: `.github/workflows/menu-feature-test.yml`
- 트리거:
  - `menu_feature`, `main` 브랜치에 대한 `push`
  - `main`, `menu_feature` 대상으로 하는 `pull_request`
- 실행 내용:
  - MongoDB 서비스 컨테이너 기동
  - JDK 17 설정
  - Gradle Wrapper 권한 부여
  - **메뉴 관련 테스트만 실행**
    ```bash
    ./gradlew test --tests "*Menu*Test"
    ```

---

### 6. 요약

- 메뉴 기능은 이제 **MongoDB 기반**으로 동작하며,  
  현재는 로그인 기능이 없는 대신 **`ownerId = "1"`** 로 고정해서 점주별 데이터를 분리했습니다.
- 프론트엔드 `Setting` 페이지에서 메뉴를 등록/수정/삭제하면,  
  Docker MongoDB 컨테이너에 연결된 `menus` 컬렉션에 데이터가 반영됩니다.
- GitHub Actions 를 통해 메뉴 기능에 대한 테스트만 선택적으로 돌릴 수 있도록 구성했습니다.


