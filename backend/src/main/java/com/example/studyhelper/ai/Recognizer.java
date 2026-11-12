package com.example.studyhelper.ai;

import java.util.List;
import java.util.Optional;

/**
 * 试卷识别统一接口（P1 预留）：后续接入智谱 GLM 多模态模型或 OCR 供应商时提供实现即可。
 */
public interface Recognizer {

    boolean available();

    Optional<PaperDraft> recognizePaper(byte[] image, String filename);

    record Wrong(String text, String reason) {}

    record PaperDraft(String subject, String unit, String type, Double score, Double fullScore, List<Wrong> wrongs) {}
}
