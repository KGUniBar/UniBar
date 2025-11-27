package org.example.service;

import org.example.model.QrCode;
import org.example.repository.QrCodeRepository;
import org.example.util.SecurityUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class QrCodeService {

    private final QrCodeRepository qrCodeRepository;
    private final SecurityUtil securityUtil;

    public QrCodeService(QrCodeRepository qrCodeRepository, SecurityUtil securityUtil) {
        this.qrCodeRepository = qrCodeRepository;
        this.securityUtil = securityUtil;
    }

    public QrCode saveQrCode(String imageData) {
        String ownerId = securityUtil.getCurrentUserId();

        QrCode qrCode = qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc(ownerId)
                .orElse(new QrCode());

        qrCode.setOwnerId(ownerId);
        qrCode.setImageData(imageData);
        qrCode.setCreatedAt(LocalDateTime.now());

        return qrCodeRepository.save(qrCode);
    }

    public QrCode getLatestQrCode() {
        String ownerId = securityUtil.getCurrentUserId();
        return qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc(ownerId)
                .orElse(null);
    }
}


