package org.example.service;

import org.example.model.Order;
import org.example.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("주문 생성 테스트 - 기본값이 정상적으로 설정되는지 확인")
    void createOrderTest() {
        // given
        Order order = new Order();
        order.setTableId(1);
        order.setTableName("Table 1");

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Order createdOrder = orderService.createOrder(order);

        // then
        assertThat(createdOrder.getOrderId()).isNotNull();
        assertThat(createdOrder.isPaid()).isFalse();
        assertThat(createdOrder.isCompleted()).isFalse();
        assertThat(createdOrder.getCreatedAt()).isNotNull();
        assertThat(createdOrder.getOrderDate()).isNotNull();
        assertThat(createdOrder.getOrderTime()).isNotNull();
        
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("테이블별 미결제 주문 조회 테스트")
    void getOrdersByTableIdTest() {
        // given
        int tableId = 1;
        Order order1 = new Order();
        order1.setTableId(tableId);
        order1.setPaid(false);
        
        Order order2 = new Order();
        order2.setTableId(tableId);
        order2.setPaid(false);

        when(orderRepository.findByTableIdAndIsPaidFalse(tableId)).thenReturn(Arrays.asList(order1, order2));

        // when
        List<Order> orders = orderService.getOrdersByTableId(tableId);

        // then
        assertThat(orders).hasSize(2);
        verify(orderRepository).findByTableIdAndIsPaidFalse(tableId);
    }

    @Test
    @DisplayName("주문 결제 처리 테스트 - isPaid 상태 변경 확인")
    void payOrderTest() {
        // given
        String mongoId = "test-mongo-id";
        Order order = new Order();
        order.setId(mongoId);
        order.setPaid(false);

        when(orderRepository.findById(mongoId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Order paidOrder = orderService.payOrder(mongoId);

        // then
        assertThat(paidOrder.isPaid()).isTrue();
        verify(orderRepository).findById(mongoId);
        verify(orderRepository).save(order);
    }
}

