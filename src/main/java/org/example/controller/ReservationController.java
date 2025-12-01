package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Reservation;
import org.example.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final org.example.util.SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<Reservation>> getReservations() {
        String ownerId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(reservationService.getReservations(ownerId));
    }

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
        String ownerId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(reservationService.createReservation(ownerId, reservation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(@PathVariable String id, @RequestBody Reservation reservation) {
        String ownerId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(reservationService.updateReservation(id, ownerId, reservation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String id) {
        String ownerId = securityUtil.getCurrentUserId();
        reservationService.deleteReservation(id, ownerId);
        return ResponseEntity.noContent().build();
    }
}
