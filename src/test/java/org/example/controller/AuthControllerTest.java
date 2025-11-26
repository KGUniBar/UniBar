package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.config.SecurityConfig;
import org.example.dto.AuthDto;
import org.example.security.JwtAuthenticationFilter;
import org.example.security.JwtTokenProvider;
import org.example.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
        })
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider; // SecurityConfig 제외해도 WebMvcTest가 기본 시큐리티를 로드할 수 있음

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("회원가입 API 테스트")
    @WithMockUser // CSRF 제외를 위해 필요할 수 있음 (security active 시)
    void signupApiTest() throws Exception {
        AuthDto.SignupRequest request = new AuthDto.SignupRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf()) // CSRF 토큰 포함
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("회원가입 성공"));
    }

    @Test
    @DisplayName("로그인 API 테스트")
    @WithMockUser
    void loginApiTest() throws Exception {
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        AuthDto.LoginResponse response = new AuthDto.LoginResponse("token", "1", "Test User");
        given(authService.login(any(AuthDto.LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.userId").value("1"));
    }

    @Test
    @DisplayName("비밀번호 재설정 API 테스트")
    @WithMockUser
    void resetPasswordApiTest() throws Exception {
        AuthDto.PasswordResetRequest request = new AuthDto.PasswordResetRequest();
        request.setUsername("testuser");
        request.setCurrentPassword("old");
        request.setNewPassword("new");

        mockMvc.perform(post("/api/auth/reset-password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("비밀번호가 성공적으로 변경되었습니다."));
    }
}

