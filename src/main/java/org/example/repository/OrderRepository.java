package org.example.repository;

import org.example.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    // 테이블별 주문 조회 (결제 안 된 것) - 점주별
    List<Order> findByOwnerIdAndTableIdAndIsPaidFalse(String ownerId, Integer tableId);
    
    // 테이블별 완료된 주문 조회 (결제 된 것) - 점주별
    List<Order> findByOwnerIdAndTableIdAndIsPaidTrue(String ownerId, Integer tableId);
    
    // 전체 주문 내역 조회 (최신순) - 점주별
    List<Order> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    
    // 미완료(조리중) 주문 조회 - 점주별
    List<Order> findByOwnerIdAndIsCompletedFalseAndIsPaidTrue(String ownerId);
}
