package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;              // MongoDB ID
    
    private Long orderId;           // 프론트엔드용 타임스탬프 ID (명세서의 id)
    private Integer tableId;        // 테이블 번호
    private String tableName;       // 테이블명
    private List<OrderItem> items;  // 주문 항목
    private String orderTime;       // 주문 시간 (HH:MM)
    private String orderDate;       // 주문 날짜 (YYYY-MM-DD)
    private int totalPrice;         // 총 금액
    
    private boolean isPaid;         // 결제 완료 여부
    private boolean isCompleted;    // 조리 완료 여부
    
    private LocalDateTime createdAt; // 실제 생성 시간 (DB 관리용)
}

