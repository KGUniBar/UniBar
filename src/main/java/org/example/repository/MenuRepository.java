package org.example.repository;

import org.example.model.Menu;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends MongoRepository<Menu, String> {

    List<Menu> findByOwnerIdOrderByCreatedAtAsc(String ownerId);

    Optional<Menu> findByIdAndOwnerId(String id, String ownerId);
}
