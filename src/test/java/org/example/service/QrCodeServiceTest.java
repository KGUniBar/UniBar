package org.example.service;

import org.example.model.QrCode;
import org.example.repository.QrCodeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QrCodeServiceTest {

    @Mock
    private QrCodeRepository qrCodeRepository;

    @InjectMocks
    private QrCodeService qrCodeService;

    @AfterEach
    void afterEach(TestInfo testInfo) {
        System.out.println("통과: " + testInfo.getDisplayName());
    }

    @Test
    @DisplayName("QR 코드 저장 시 ownerId가 1로 설정되고 기본 값이 올바르게 세팅된다")
    void saveQrCode_setsOwnerIdAndDefaults() {
        // given
        String imageData = "data:image/png;base64,abc";

        when(qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc("1"))
                .thenReturn(Optional.empty());
        when(qrCodeRepository.save(any(QrCode.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        QrCode saved = qrCodeService.saveQrCode(imageData);

        // then
        assertThat(saved.getOwnerId()).isEqualTo("1");
        assertThat(saved.getImageData()).isEqualTo(imageData);
        assertThat(saved.getCreatedAt()).isNotNull();

        verify(qrCodeRepository).save(any(QrCode.class));
    }

    @Test
    @DisplayName("저장된 QR 코드가 없으면 null을 반환한다")
    void getLatestQrCode_returnsNullWhenNotExists() {
        // given
        when(qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc("1"))
                .thenReturn(Optional.empty());

        // when
        QrCode result = qrCodeService.getLatestQrCode();

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("저장된 QR 코드가 있으면 가장 최근 정보를 반환한다")
    void getLatestQrCode_returnsLatest() {
        // given
        QrCode qrCode = new QrCode();
        qrCode.setId("id1");
        qrCode.setOwnerId("1");
        qrCode.setImageData("img");
        qrCode.setCreatedAt(LocalDateTime.now());

        when(qrCodeRepository.findTopByOwnerIdOrderByCreatedAtDesc("1"))
                .thenReturn(Optional.of(qrCode));

        // when
        QrCode result = qrCodeService.getLatestQrCode();

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("id1");
        assertThat(result.getImageData()).isEqualTo("img");
    }
}


