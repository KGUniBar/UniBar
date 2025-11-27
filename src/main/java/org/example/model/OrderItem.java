package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private Long id;        // 메뉴 ID
    private String name;    // 메뉴명
    private int quantity;   // 수량
    private int price;      // 가격 (명세서 모델에는 없지만 총액 계산을 위해 필요)
}

