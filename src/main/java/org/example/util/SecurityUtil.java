package org.example.util;

import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {
    
    public String getCurrentUserId() {
        // 로그인 기능 미구현으로 인한 하드코딩
        return "1"; 
    }
}

