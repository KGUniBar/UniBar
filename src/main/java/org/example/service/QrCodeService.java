package org.example.service;

import org.example.model.QrCode;
import org.example.repository.QrCodeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class QrCodeService {

    private static final String FIXED_OWNER_ID = "1";

    private final QrCodeRepository qrCodeRepository;

    public QrCodeService(QrCodeRepository qrCodeRepository) {
        this.qrCodeRepository = qrCodeRepository;
    }

    public QrCode saveQrCode(String imageData) {
        QrCode qrCode = qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc(FIXED_OWNER_ID)
                .orElse(new QrCode());

        qrCode.setOwnerId(FIXED_OWNER_ID);
        qrCode.setImageData(imageData);
        qrCode.setCreatedAt(LocalDateTime.now());

        return qrCodeRepository.save(qrCode);
    }

    public QrCode getLatestQrCode() {
        return qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc(FIXED_OWNER_ID)
                .orElse(null);
    }
}


