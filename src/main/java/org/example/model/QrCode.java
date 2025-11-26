package org.example.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "qrcodes")
public class QrCode {

    @Id
    private String id;

    private String ownerId;

    private String imageData;

    private LocalDateTime createdAt;

    public QrCode() {
    }

    public QrCode(String id, String ownerId, String imageData, LocalDateTime createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.imageData = imageData;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}


