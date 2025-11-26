package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;
    
    private String username; // 아이디
    private String password; // 비밀번호
    private String name;     // 이름
    private String phone;    // 전화번호
    
    @Builder.Default
    private String role = "ROLE_USER";
}

