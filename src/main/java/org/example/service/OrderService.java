package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.exception.ResourceNotFoundException;
import org.example.exception.UnauthorizedException;
import org.example.model.Order;
import org.example.repository.OrderRepository;
import org.example.util.SecurityUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final SecurityUtil securityUtil;

    // 주문 생성
    public Order createOrder(Order order) {
        String currentUserId = securityUtil.getCurrentUserId();
        order.setOwnerId(currentUserId);

        order.setOrderId(System.currentTimeMillis()); // 타임스탬프 ID
        order.setPaid(false);
        order.setCompleted(false);
        order.setCreatedAt(LocalDateTime.now());

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
        String currentUserId = securityUtil.getCurrentUserId();
        return orderRepository.findByOwnerIdAndTableIdAndIsPaidFalse(currentUserId, tableId);
    }

    // 주문 결제 처리
    public Order payOrder(String id) {
        String currentUserId = securityUtil.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("주문을 찾을 수 없습니다."));

        if (!order.getOwnerId().equals(currentUserId)) {
            throw new UnauthorizedException("이 주문에 대한 권한이 없습니다.");
        }

        order.setPaid(true);
        return orderRepository.save(order);
    }

    // 미완료(조리중) 주문 조회 (결제 완료 + 조리 미완료)
    public List<Order> getRemainingOrders() {
        String currentUserId = securityUtil.getCurrentUserId();
        return orderRepository.findByOwnerIdAndIsCompletedFalseAndIsPaidTrue(currentUserId);
    }

    // 조리 완료 처리
    public Order completeOrder(String id) {
        String currentUserId = securityUtil.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("주문을 찾을 수 없습니다."));

        if (!order.getOwnerId().equals(currentUserId)) {
            throw new UnauthorizedException("이 주문에 대한 권한이 없습니다.");
        }

        order.setCompleted(true);
        return orderRepository.save(order);
    }

    // 전체 주문 조회
    public List<Order> getAllOrders() {
        String currentUserId = securityUtil.getCurrentUserId();
        return orderRepository.findByOwnerIdOrderByCreatedAtDesc(currentUserId);
    }
}
