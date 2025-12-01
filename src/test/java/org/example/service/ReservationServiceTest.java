package org.example.service;

import org.example.model.Reservation;
import org.example.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

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
    }

    @Test
    @DisplayName("내 예약 목록 조회")
    void getReservations() {
        // given
        given(reservationRepository.findByOwnerIdOrderByCreatedAtAsc(TEST_OWNER_ID))
                .willReturn(Arrays.asList(reservation));

        // when
        List<Reservation> result = reservationService.getReservations(TEST_OWNER_ID);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOwnerId()).isEqualTo(TEST_OWNER_ID);
        verify(reservationRepository).findByOwnerIdOrderByCreatedAtAsc(TEST_OWNER_ID);
    }

    @Test
    @DisplayName("예약 생성")
    void createReservation() {
        // given
        given(reservationRepository.save(any(Reservation.class))).willReturn(reservation);

        // when
        Reservation created = reservationService.createReservation(TEST_OWNER_ID, reservation);

        // then
        assertThat(created.getOwnerId()).isEqualTo(TEST_OWNER_ID);
        assertThat(created.getStatus()).isEqualTo("confirmed");
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    @DisplayName("예약 수정 - 성공")
    void updateReservation() {
        // given
        String reservationId = "res-1";
        Reservation updatedInfo = new Reservation();
        updatedInfo.setCustomerName("Updated Name");
        updatedInfo.setPhoneNumber("010-9999-9999");
        updatedInfo.setReservationTime(LocalDateTime.now().plusDays(2));
        updatedInfo.setNumberOfGuests(2);
        updatedInfo.setStatus("cancelled");

        given(reservationRepository.findByIdAndOwnerId(reservationId, TEST_OWNER_ID))
                .willReturn(Optional.of(reservation));
        given(reservationRepository.save(any(Reservation.class))).willReturn(reservation);

        // when
        Reservation result = reservationService.updateReservation(reservationId, TEST_OWNER_ID, updatedInfo);

        // then
        assertThat(result.getCustomerName()).isEqualTo("Updated Name");
        assertThat(result.getStatus()).isEqualTo("cancelled");
        verify(reservationRepository).findByIdAndOwnerId(reservationId, TEST_OWNER_ID);
    }

    @Test
    @DisplayName("예약 수정 - 실패 (존재하지 않거나 내 예약이 아님)")
    void updateReservation_Fail() {
        // given
        String reservationId = "res-1";
        given(reservationRepository.findByIdAndOwnerId(reservationId, TEST_OWNER_ID))
                .willReturn(Optional.empty());

        // when & then
        assertThrows(RuntimeException.class, () -> 
            reservationService.updateReservation(reservationId, TEST_OWNER_ID, reservation)
        );
    }

    @Test
    @DisplayName("예약 삭제 - 성공")
    void deleteReservation() {
        // given
        String reservationId = "res-1";
        given(reservationRepository.findByIdAndOwnerId(reservationId, TEST_OWNER_ID))
                .willReturn(Optional.of(reservation));

        // when
        reservationService.deleteReservation(reservationId, TEST_OWNER_ID);

        // then
        verify(reservationRepository).delete(reservation);
    }
}

