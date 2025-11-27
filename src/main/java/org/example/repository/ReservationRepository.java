package org.example.repository;

import org.example.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends MongoRepository<Reservation, String> {

    List<Reservation> findByOwnerIdOrderByCreatedAtAsc(String ownerId);

    Optional<Reservation> findByIdAndOwnerId(String id, String ownerId);
}
