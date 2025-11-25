package org.example.service;

import org.example.model.Menu;
import org.example.repository.MenuRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuRepository menuRepository;

    @InjectMocks
    private MenuService menuService;

    @Test
    @DisplayName("메뉴 등록 시 ownerId가 1로 설정되고 기본 값이 올바르게 세팅된다")
    void createMenu_setsOwnerIdAndDefaults() {
        // given
        Menu request = new Menu();
        request.setName("생맥주");
        request.setPrice(5000);

        when(menuRepository.save(any(Menu.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Menu saved = menuService.createMenu(request);

        // then
        assertThat(saved.getOwnerId()).isEqualTo("1");
        assertThat(saved.getMenuId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getName()).isEqualTo("생맥주");
        assertThat(saved.getPrice()).isEqualTo(5000);

        verify(menuRepository).save(any(Menu.class));
    }
}


