package org.example.repository;

import org.example.model.QrCode;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QrCodeRepository extends MongoRepository<QrCode, String> {

    Optional<QrCode> findTopByOwnerIdOrderByCreatedAtDesc(String ownerId);
}


