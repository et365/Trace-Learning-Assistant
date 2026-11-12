package com.example.studyhelper.ai;

import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * OCR 未接入（后续再做）：恒返回不可用，前端「拍试卷」按钮提示改用手动录入。
 */
@Component
public class StubRecognizer implements Recognizer {

    @Override
    public boolean available() {
        return false;
    }

    @Override
    public Optional<PaperDraft> recognizePaper(byte[] image, String filename) {
        return Optional.empty();
    }
}
