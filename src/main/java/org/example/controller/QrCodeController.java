package org.example.controller;

import org.example.dto.QrCodeRequest;
import org.example.model.QrCode;
import org.example.service.QrCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    public ResponseEntity<QrCode> getQrCode() {
        QrCode qrCode = qrCodeService.getLatestQrCode();
        if (qrCode == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(qrCode);
    }

    @PostMapping
    public ResponseEntity<QrCode> uploadQrCode(@RequestBody QrCodeRequest request) {
        if (request.getImageData() == null || request.getImageData().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        QrCode saved = qrCodeService.saveQrCode(request.getImageData());
        return ResponseEntity.ok(saved);
    }
}


