package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.config.SecurityConfig;
import org.example.model.Menu;
import org.example.security.JwtAuthenticationFilter;
import org.example.service.MenuService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MenuController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
        })
class MenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MenuService menuService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void afterEach(TestInfo testInfo) {
        System.out.println("통과: " + testInfo.getDisplayName());
    }

    @Test
    @WithMockUser
    @DisplayName("메뉴 등록 API가 정상적으로 Menu를 반환한다")
    void createMenuApiTest() throws Exception {
        // given
        Menu request = new Menu();
        request.setName("생맥주");
        request.setPrice(5000);

        Menu created = new Menu();
        created.setId("menu-id-1");
        created.setOwnerId("1");
        created.setMenuId(123456789L);
        created.setName("생맥주");
        created.setPrice(5000);

        given(menuService.createMenu(any(Menu.class))).willReturn(created);

        // when & then
        mockMvc.perform(post("/api/menus")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("menu-id-1"))
                .andExpect(jsonPath("$.name").value("생맥주"))
                .andExpect(jsonPath("$.price").value(5000));
    }
}
