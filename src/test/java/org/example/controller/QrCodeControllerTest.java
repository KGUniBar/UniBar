package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.QrCodeRequest;
import org.example.model.QrCode;
import org.example.service.QrCodeService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(QrCodeController.class)
class QrCodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QrCodeService qrCodeService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void afterEach(TestInfo testInfo) {
        System.out.println("통과: " + testInfo.getDisplayName());
    }

    @Test
    @DisplayName("QR 코드가 없으면 204 No Content를 반환한다")
    void getQrCode_noContent() throws Exception {
        // given
        given(qrCodeService.getLatestQrCode()).willReturn(null);

        // when & then
        mockMvc.perform(get("/api/qrcode"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("QR 코드가 있으면 200 OK와 함께 데이터를 반환한다")
    void getQrCode_ok() throws Exception {
        // given
        QrCode qrCode = new QrCode();
        qrCode.setId("id1");
        qrCode.setOwnerId("1");
        qrCode.setImageData("data:image/png;base64,abc");
        qrCode.setCreatedAt(LocalDateTime.now());

        given(qrCodeService.getLatestQrCode()).willReturn(qrCode);

        // when & then
        mockMvc.perform(get("/api/qrcode"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("id1"))
                .andExpect(jsonPath("$.ownerId").value("1"))
                .andExpect(jsonPath("$.imageData").value("data:image/png;base64,abc"));
    }

    @Test
    @DisplayName("유효한 QR 코드 이미지 데이터로 업로드하면 200 OK와 함께 저장된 데이터를 반환한다")
    void uploadQrCode_ok() throws Exception {
        // given
        QrCodeRequest request = new QrCodeRequest("data:image/png;base64,abc");

        QrCode saved = new QrCode();
        saved.setId("id1");
        saved.setOwnerId("1");
        saved.setImageData(request.getImageData());
        saved.setCreatedAt(LocalDateTime.now());

        given(qrCodeService.saveQrCode(any(String.class))).willReturn(saved);

        // when & then
        mockMvc.perform(post("/api/qrcode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("id1"))
                .andExpect(jsonPath("$.ownerId").value("1"))
                .andExpect(jsonPath("$.imageData").value("data:image/png;base64,abc"));
    }

    @Test
    @DisplayName("imageData가 비어 있으면 400 Bad Request를 반환한다")
    void uploadQrCode_badRequest() throws Exception {
        // given
        QrCodeRequest request = new QrCodeRequest("");

        // when & then
        mockMvc.perform(post("/api/qrcode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(qrCodeService);
    }
}


