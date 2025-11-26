package org.example.service;

import org.example.dto.AuthDto;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.example.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("회원가입 성공 테스트")
    void signupSuccessTest() {
        // given
        AuthDto.SignupRequest request = new AuthDto.SignupRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setName("Test User");
        request.setPhone("010-1234-5678");

        given(userRepository.existsByUsername("testuser")).willReturn(false);
        given(passwordEncoder.encode("password")).willReturn("encodedPassword");

        // when
        authService.signup(request);

        // then
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 아이디")
    void signupFailDuplicateTest() {
        // given
        AuthDto.SignupRequest request = new AuthDto.SignupRequest();
        request.setUsername("testuser");

        given(userRepository.existsByUsername("testuser")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("이미 존재하는 아이디입니다.");
    }

    @Test
    @DisplayName("로그인 성공 테스트")
    void loginSuccessTest() {
        // given
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        User user = User.builder()
                .id("1")
                .username("testuser")
                .password("encodedPassword")
                .name("Test User")
                .build();

        given(userRepository.findByUsername("testuser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password", "encodedPassword")).willReturn(true);
        given(jwtTokenProvider.createToken("testuser", "1")).willReturn("accessToken");

        // when
        AuthDto.LoginResponse response = authService.login(request);

        // then
        assertThat(response.getToken()).isEqualTo("accessToken");
        assertThat(response.getUserId()).isEqualTo("1");
        assertThat(response.getName()).isEqualTo("Test User");
    }

    @Test
    @DisplayName("비밀번호 재설정 성공 테스트")
    void resetPasswordSuccessTest() {
        // given
        AuthDto.PasswordResetRequest request = new AuthDto.PasswordResetRequest();
        request.setUsername("testuser");
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword");

        User user = User.builder()
                .username("testuser")
                .password("encodedOldPassword")
                .build();

        given(userRepository.findByUsername("testuser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("oldPassword", "encodedOldPassword")).willReturn(true);
        given(passwordEncoder.encode("newPassword")).willReturn("encodedNewPassword");

        // when
        authService.resetPassword(request);

        // then
        assertThat(user.getPassword()).isEqualTo("encodedNewPassword");
        verify(userRepository).save(user);
    }
}

