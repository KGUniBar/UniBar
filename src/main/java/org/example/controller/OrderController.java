package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 주문 생성
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    // 테이블별 주문 조회
    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<Order>> getTableOrders(@PathVariable Integer tableId) {
        return ResponseEntity.ok(orderService.getOrdersByTableId(tableId));
    }
    
    // 전체 주문 조회
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // 결제 처리 (상태 변경)
    @PostMapping("/{id}/pay")
    public ResponseEntity<Order> payOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.payOrder(id));
    }
}

