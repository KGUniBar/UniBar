# 🔐 UniBar 인증 시스템 가이드

UniBar 프로젝트의 인증 시스템(로그인, 회원가입, 비밀번호 재설정)에 대한 문서입니다.
본 시스템은 **Spring Security**와 **JWT(JSON Web Token)**를 기반으로 구현되었으며, **MongoDB**를 데이터 저장소로 사용합니다.

---

## 1. 주요 기능

| 기능 | 설명 | 엔드포인트 | 권한 |
|---|---|---|---|
| **회원가입** | 새로운 사용자를 등록합니다. (비밀번호 암호화 저장) | `POST /api/auth/signup` | 누구나 |
| **로그인** | 아이디/비밀번호로 인증하고 JWT 토큰을 발급받습니다. | `POST /api/auth/login` | 누구나 |
| **비밀번호 재설정** | 기존 비밀번호 확인 후 새로운 비밀번호로 변경합니다. | `POST /api/auth/reset-password` | 누구나 |

---

## 2. API 명세 (API Specification)

### 2.1 회원가입 (Signup)
*   **URL**: `/api/auth/signup`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "password": "password123",
      "name": "홍길동",
      "phone": "010-1234-5678"
    }
    ```
*   **Response**:
    *   `200 OK`: "회원가입 성공"
    *   `500 Error`: "이미 존재하는 아이디입니다." 등 에러 메시지

### 2.2 로그인 (Login)
*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "password": "password123"
    }
    ```
*   **Response**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "userId": "65a1b2c3d4e5f6...",
      "name": "홍길동"
    }
    ```

### 2.3 비밀번호 재설정 (Reset Password)
*   **URL**: `/api/auth/reset-password`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "currentPassword": "password123",
      "newPassword": "newPassword123"
    }
    ```
*   **Response**:
    *   `200 OK`: "비밀번호가 성공적으로 변경되었습니다."
    *   `500 Error`: "현재 비밀번호가 일치하지 않습니다." 등 에러 메시지

---

## 3. 실행 및 테스트 방법

### 3.1 Docker로 실행 (권장)
백엔드, 프론트엔드, 데이터베이스를 한 번에 실행합니다.
```bash
docker-compose up --build -d
```
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend**: [http://localhost:8080](http://localhost:8080)

### 3.2 로컬 테스트 (수동 실행)
1.  **MongoDB 실행**: 로컬에 MongoDB가 설치되어 있거나 Docker로 실행 중이어야 합니다.
2.  **Backend 실행**:
    ```bash
    ./gradlew bootRun
    ```
3.  **Frontend 실행**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 4. 데이터베이스 확인 방법 (MongoDB)

회원 정보는 `unibar` 데이터베이스의 `users` 컬렉션에 저장됩니다.

### 터미널에서 확인하기
1.  실행 중인 MongoDB 컨테이너 접속:
    ```bash
    docker exec -it unibar-mongo mongosh unibar
    ```
2.  회원 데이터 조회:
    ```javascript
    db.users.find().pretty()
    ```

### GUI 툴(MongoDB Compass)로 확인하기
*   **접속 주소**: `mongodb://localhost:27017`
*   **Database**: `unibar`
*   **Collection**: `users`

---

## 5. 기술 스택
*   **Language**: Java 17
*   **Framework**: Spring Boot 3.2.3
*   **Security**: Spring Security, JWT (io.jsonwebtoken 0.11.5)
*   **Database**: MongoDB
*   **Build Tool**: Gradle

