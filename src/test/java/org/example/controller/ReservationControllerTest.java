package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.config.SecurityConfig;
import org.example.model.Reservation;
import org.example.security.JwtAuthenticationFilter;
import org.example.service.ReservationService;
import org.example.util.SecurityUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReservationController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
        })
@AutoConfigureMockMvc(addFilters = false) // Security Filter 비활성화
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @MockBean
    private SecurityUtil securityUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private final String TEST_OWNER_ID = "test-owner";
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        reservation = new Reservation();
        reservation.setId("res-1");
        reservation.setOwnerId(TEST_OWNER_ID);
        reservation.setCustomerName("Hong Gil Dong");
        reservation.setPhoneNumber("010-1234-5678");
        reservation.setReservationTime(LocalDateTime.now().plusDays(1));
        reservation.setNumberOfGuests(4);
        reservation.setStatus("confirmed");
        
        // SecurityUtil Mocking: 항상 TEST_OWNER_ID 반환
        given(securityUtil.getCurrentUserId()).willReturn(TEST_OWNER_ID);
    }

    @Test
    @DisplayName("예약 목록 조회 테스트")
    @WithMockUser
    void getReservations() throws Exception {
        // given
        List<Reservation> reservations = Arrays.asList(reservation);
        given(reservationService.getReservations(TEST_OWNER_ID)).willReturn(reservations);

        // when & then
        mockMvc.perform(get("/api/reservations"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerName").value("Hong Gil Dong"))
                .andExpect(jsonPath("$[0].ownerId").value(TEST_OWNER_ID));
        
        verify(securityUtil).getCurrentUserId();
        verify(reservationService).getReservations(TEST_OWNER_ID);
    }

    @Test
    @DisplayName("예약 생성 테스트")
    @WithMockUser
    void createReservation() throws Exception {
        // given
        given(reservationService.createReservation(eq(TEST_OWNER_ID), any(Reservation.class)))
                .willReturn(reservation);

        // when & then
        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservation)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Hong Gil Dong"));

        verify(securityUtil).getCurrentUserId();
        verify(reservationService).createReservation(eq(TEST_OWNER_ID), any(Reservation.class));
    }

    @Test
    @DisplayName("예약 수정 테스트")
    @WithMockUser
    void updateReservation() throws Exception {
        // given
        String reservationId = "res-1";
        given(reservationService.updateReservation(eq(reservationId), eq(TEST_OWNER_ID), any(Reservation.class)))
                .willReturn(reservation);

        // when & then
        mockMvc.perform(put("/api/reservations/{id}", reservationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservation)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservationId));

        verify(securityUtil).getCurrentUserId();
        verify(reservationService).updateReservation(eq(reservationId), eq(TEST_OWNER_ID), any(Reservation.class));
    }

    @Test
    @DisplayName("예약 삭제 테스트")
    @WithMockUser
    void deleteReservation() throws Exception {
        // given
        String reservationId = "res-1";

        // when & then
        mockMvc.perform(delete("/api/reservations/{id}", reservationId))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(securityUtil).getCurrentUserId();
        verify(reservationService).deleteReservation(reservationId, TEST_OWNER_ID);
    }
}

