package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    private String id;

    private String ownerId;
    private Long reservationId;
    private String customerName;
    private String phoneNumber;
    private LocalDateTime reservationTime;
    private int numberOfGuests;
    private String status; // e.g., "confirmed", "cancelled", "completed"
    private LocalDateTime createdAt;
}
