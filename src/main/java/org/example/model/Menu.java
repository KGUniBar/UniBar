package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "menus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Menu {

    @Id
    private String id;          // MongoDB ObjectId

    private String ownerId;     // 점주 ID (현재는 1로 고정)
    private Long menuId;        // 프론트엔드용 타임스탬프 ID
    private String name;        // 메뉴명
    private int price;          // 가격
    private LocalDateTime createdAt; // 생성 일시
}
