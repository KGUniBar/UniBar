package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.Order;
import org.example.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false) // 시큐리티 필터 비활성화 (주문 API만 슬라이스 테스트)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("주문 생성 API 테스트")
    void createOrderApiTest() throws Exception {
        // given
        Order order = new Order();
        order.setTableId(1);
        order.setTableName("Table 1");
        
        Order createdOrder = new Order();
        createdOrder.setTableId(1);
        createdOrder.setTableName("Table 1");
        createdOrder.setOrderId(123456789L); // 생성된 ID

        given(orderService.createOrder(any(Order.class))).willReturn(createdOrder);

        // when & then
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").exists())
                .andExpect(jsonPath("$.tableId").value(1));
    }

    @Test
    @DisplayName("테이블별 주문 조회 API 테스트")
    void getTableOrdersApiTest() throws Exception {
        // given
        int tableId = 1;
        Order order1 = new Order();
        order1.setTableId(tableId);
        Order order2 = new Order();
        order2.setTableId(tableId);
        
        List<Order> orders = Arrays.asList(order1, order2);

        given(orderService.getOrdersByTableId(tableId)).willReturn(orders);

        // when & then
        mockMvc.perform(get("/api/orders/table/{tableId}", tableId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("주문 결제 API 테스트")
    void payOrderApiTest() throws Exception {
        // given
        String mongoId = "test-mongo-id";
        Order paidOrder = new Order();
        paidOrder.setId(mongoId);
        paidOrder.setPaid(true);

        given(orderService.payOrder(eq(mongoId))).willReturn(paidOrder);

        // when & then
        mockMvc.perform(post("/api/orders/{id}/pay", mongoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(true));
    }
}

