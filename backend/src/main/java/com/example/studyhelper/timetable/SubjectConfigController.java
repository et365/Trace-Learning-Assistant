package com.example.studyhelper.timetable;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SubjectConfigController {

    public record SubjectConfigDto(String subject, boolean noHomework, String color, double target, boolean hasExam) {}
    public record UpsertRequest(String subject, Boolean noHomework, String color, Double target, Boolean hasExam) {}

    private final SubjectConfigRepository repo;

    public SubjectConfigController(SubjectConfigRepository repo) { this.repo = repo; }

    @GetMapping("/subject-configs")
    @Transactional(readOnly = true)
    public List<SubjectConfigDto> list() {
        return repo.findAll().stream()
                .map(c -> new SubjectConfigDto(c.getSubject(), c.isNoHomework(), c.getColor(), c.getTarget(), c.isHasExam()))
                .toList();
    }

    @PostMapping("/subject-configs")
    @Transactional
    public SubjectConfigDto upsert(@RequestBody UpsertRequest req) {
        if (req.subject() == null || req.subject().isBlank()) throw new IllegalArgumentException("科目不能为空");
        var c = repo.findById(req.subject()).orElseGet(() -> {
            var n = new SubjectConfig();
            n.setSubject(req.subject());
            return n;
        });
        if (req.noHomework() != null) c.setNoHomework(req.noHomework());
        if (req.color() != null && req.color().matches("^#[0-9a-fA-F]{6}$")) c.setColor(req.color());
        if (req.target() != null) {
            if (req.target() < 0 || req.target() > 150) throw new IllegalArgumentException("目标分需在 0 到 150 之间");
            c.setTarget(req.target());
        }
        if (req.hasExam() != null) c.setHasExam(req.hasExam());
        repo.save(c);
        return new SubjectConfigDto(c.getSubject(), c.isNoHomework(), c.getColor(), c.getTarget(), c.isHasExam());
    }
}
