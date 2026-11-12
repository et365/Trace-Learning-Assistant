package com.example.studyhelper.ai;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    public record ParseRequest(String text) {}

    private final RuleHomeworkParser parser;

    public AiController(RuleHomeworkParser parser) { this.parser = parser; }

    @PostMapping("/parse-homework")
    public RuleHomeworkParser.ParsedHomework parse(@RequestBody ParseRequest req) {
        if (req.text() == null || req.text().isBlank()) throw new IllegalArgumentException("请粘贴老师消息原文");
        return parser.parse(req.text());
    }
}
