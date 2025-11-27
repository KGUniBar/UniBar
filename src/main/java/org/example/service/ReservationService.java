package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Reservation;
import org.example.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public List<Reservation> getReservations(String ownerId) {
        return reservationRepository.findByOwnerIdOrderByCreatedAtAsc(ownerId);
    }

    public Reservation createReservation(String ownerId, Reservation reservation) {
        reservation.setId(null); // MongoDB will generate the ID
        reservation.setOwnerId(ownerId);
        reservation.setReservationId(System.currentTimeMillis());
        reservation.setCreatedAt(LocalDateTime.now());
        if (reservation.getStatus() == null) {
            reservation.setStatus("confirmed");
        }
        return reservationRepository.save(reservation);
    }

    public Reservation updateReservation(String id, String ownerId, Reservation updated) {
        Reservation reservation = reservationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setCustomerName(updated.getCustomerName());
        reservation.setPhoneNumber(updated.getPhoneNumber());
        reservation.setReservationTime(updated.getReservationTime());
        reservation.setNumberOfGuests(updated.getNumberOfGuests());
        reservation.setStatus(updated.getStatus());
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(String id, String ownerId) {
        Reservation reservation = reservationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservationRepository.delete(reservation);
    }
}
