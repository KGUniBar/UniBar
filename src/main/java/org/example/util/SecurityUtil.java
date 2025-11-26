package org.example.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    /**
     * 현재 인증된 사용자의 ID를 반환합니다.
     * JwtAuthenticationFilter 에서 UserDetails.username 에 userId 를 넣기 때문에
     * 여기서는 username 을 그대로 userId 로 사용합니다.
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증 정보가 없습니다.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof String) {
            return (String) principal;
        }

        throw new RuntimeException("유효하지 않은 인증 정보입니다.");
    }
}


