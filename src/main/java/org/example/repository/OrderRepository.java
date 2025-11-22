package org.example.repository;

import org.example.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    // 테이블별 주문 조회 (결제 안 된 것)
    List<Order> findByTableIdAndIsPaidFalse(Integer tableId);
    
    // 테이블별 완료된 주문 조회 (결제 된 것)
    List<Order> findByTableIdAndIsPaidTrue(Integer tableId);
    
    // 전체 주문 내역 조회 (최신순)
    List<Order> findAllByOrderByCreatedAtDesc();
    
    // 미완료(조리중) 주문 조회
    List<Order> findByIsCompletedFalseAndIsPaidTrue();
}

