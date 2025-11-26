package org.example.dto;

public class QrCodeRequest {
    private String imageData;

    public QrCodeRequest() {
    }

    public QrCodeRequest(String imageData) {
        this.imageData = imageData;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}


