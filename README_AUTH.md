# 🔐 인증 기능 명세서 (Authentication Specification)

## 1. 개요
UniBar 서비스의 사용자 인증/인가를 담당하는 모듈입니다. JWT(JSON Web Token) 기반의 인증 방식을 사용하며, Spring Security를 통해 보안을 관리합니다.

## 2. 주요 기능
- **회원가입 (Signup)**: 새로운 사용자 계정 생성 (비밀번호 암호화 저장)
- **로그인 (Login)**: 아이디/비밀번호 검증 및 JWT 토큰 발급
- **비밀번호 재설정 (Reset Password)**: 아이디와 전화번호 검증 후 비밀번호 변경
- **인증 필터 (Authentication Filter)**: 매 요청마다 헤더의 JWT 유효성 검사

## 3. API 명세

### 3.1 회원가입
- **Endpoint**: `POST /api/auth/signup`
- **Description**: 새로운 사용자를 등록합니다.
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123",
    "confirmPassword": "password123",
    "name": "홍길동",
    "phoneNumber": "010-1234-5678"
  }
  ```
- **Response**:
  - `200 OK`: "회원가입 성공"
  - `400 Bad Request`: "이미 존재하는 아이디입니다", "비밀번호가 일치하지 않습니다" 등

### 3.2 로그인
- **Endpoint**: `POST /api/auth/login`
- **Description**: 사용자 인증 후 JWT 토큰을 발급합니다.
- **Request Body**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "username": "user123",
      "name": "홍길동"
    }
    ```
  - `401 Unauthorized`: "비밀번호가 일치하지 않습니다"
  - `404 Not Found`: "존재하지 않는 사용자입니다"

### 3.3 비밀번호 재설정
- **Endpoint**: `POST /api/auth/reset-password`
- **Description**: 사용자 정보를 확인하고 비밀번호를 재설정합니다.
- **Request Body**:
  ```json
  {
    "username": "user123",
    "phoneNumber": "010-1234-5678",
    "newPassword": "newPassword123",
    "confirmNewPassword": "newPassword123"
  }
  ```
- **Response**:
  - `200 OK`: "비밀번호가 성공적으로 변경되었습니다."
  - `400 Bad Request`: "사용자 정보가 일치하지 않습니다", "비밀번호가 일치하지 않습니다"

## 4. 보안 설정 (Security Config)

### 4.1 인증 방식
- **Token Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Algorithm**: HMAC SHA-256

### 4.2 접근 제어
- **Permit All (누구나 접근 가능)**:
  - `/api/auth/**` (로그인, 회원가입, 비밀번호 재설정)
  - `/` (Health Check)
  - `/error`
- **Authenticated (인증 필요)**:
  - 위 경로를 제외한 모든 API 요청 (`/api/orders/**` 등)

### 4.3 CORS 설정
프론트엔드(`http://localhost:5173`)와의 통신을 위해 CORS가 허용되어 있습니다.
- **Allowed Origins**: `http://localhost:5173`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type

## 5. 데이터 모델 (User)
MongoDB `users` 컬렉션에 저장됩니다.
```java
public class User {
    @Id
    private String id;          // MongoDB ObjectId
    private String username;    // 아이디 (Unique)
    private String password;    // 암호화된 비밀번호
    private String name;        // 사용자 이름
    private String phoneNumber; // 전화번호
    private String role;        // 권한 (ROLE_USER)
}
```

## 6. 테스트 (Testing)
GitHub Actions를 통해 CI/CD 파이프라인에서 자동으로 테스트됩니다.
- **Workflow**: `.github/workflows/auth-test.yml`
- **Test Class**: `AuthServiceTest.java`, `AuthControllerTest.java`
- **커버리지**: 정상 회원가입/로그인, 중복 아이디 예외, 비밀번호 불일치 예외 등 검증
