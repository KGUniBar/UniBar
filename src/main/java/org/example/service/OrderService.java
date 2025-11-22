package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 주문 생성
    public Order createOrder(Order order) {
        // 명세서에 따른 기본값 설정
        order.setOrderId(System.currentTimeMillis()); // 타임스탬프 ID
        order.setPaid(false);
        order.setCompleted(false);
        order.setCreatedAt(LocalDateTime.now());
        
        // 날짜/시간 자동 설정 (프론트에서 안 보냈을 경우)
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDate.now().toString());
        }
        if (order.getOrderTime() == null) {
            order.setOrderTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        }
        
        return orderRepository.save(order);
    }

    // 테이블별 미결제 주문 조회
    public List<Order> getOrdersByTableId(Integer tableId) {
        return orderRepository.findByTableIdAndIsPaidFalse(tableId);
    }

    // 주문 결제 처리
    public Order payOrder(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaid(true);
        return orderRepository.save(order);
    }
    
    // 전체 주문 조회
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}

