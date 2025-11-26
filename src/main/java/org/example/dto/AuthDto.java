package org.example.dto;

import lombok.Getter;
import lombok.Setter;

public class AuthDto {
    
    @Getter
    @Setter
    public static class SignupRequest {
        private String username;
        private String password;
        private String name;
        private String phone;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    @lombok.AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String userId; // MongoDB Object ID
        private String name;
    }

    @Getter
    @Setter
    public static class PasswordResetRequest {
        private String username;
        private String currentPassword;
        private String newPassword;
    }
}

