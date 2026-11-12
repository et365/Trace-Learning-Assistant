package com.example.studyhelper.exam;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExamController {

    public record MasteredRequest(boolean mastered) {}

    private final ExamService service;

    public ExamController(ExamService service) { this.service = service; }

    @GetMapping("/papers")
    public List<ExamService.PaperDto> papers() {
        return service.list();
    }

    @PostMapping("/papers")
    public ExamService.PaperDto create(@RequestBody ExamService.CreatePaperRequest req) {
        return service.create(req);
    }

    @PutMapping("/papers/order")
    public void reorder(@RequestBody ExamService.ReorderRequest req) {
        if (req.ids() != null) service.reorder(req.ids());
    }

    @PutMapping("/papers/{id}")
    public ExamService.PaperDto update(@PathVariable Long id, @RequestBody ExamService.CreatePaperRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/papers/{id}")
    public void deletePaper(@PathVariable Long id) {
        service.deletePaper(id);
    }

    @PostMapping("/wrongs")
    public ExamService.WrongDto addWrong(@RequestBody ExamService.AddWrongRequest req) {
        return service.addManual(req);
    }

    @GetMapping("/exams/analysis")
    public ExamService.AnalysisDto analysis() {
        return service.analysis();
    }

    @GetMapping("/wrongs")
    public List<ExamService.WrongDto> wrongs(@RequestParam(required = false) String subject,
                                             @RequestParam(required = false) String semester) {
        return service.wrongs(subject, semester);
    }

    @DeleteMapping("/wrongs/{id}")
    public void deleteWrong(@PathVariable Long id) {
        service.deleteWrong(id);
    }

    @GetMapping("/wrongs/trash")
    public List<ExamService.WrongDto> trash() {
        return service.trash();
    }

    @PostMapping("/wrongs/{id}/restore")
    public ExamService.WrongDto restore(@PathVariable Long id) {
        return service.restoreWrong(id);
    }

    @DeleteMapping("/wrongs/{id}/permanent")
    public void deletePermanent(@PathVariable Long id) {
        service.deleteWrongPermanent(id);
    }

    @DeleteMapping("/wrongs/trash")
    public Map<String, Integer> emptyTrash() {
        return Map.of("deleted", service.emptyTrash());
    }

    @PatchMapping("/wrongs/{id}/mastered")
    public ExamService.WrongDto setMastered(@PathVariable Long id, @RequestBody MasteredRequest req) {
        return service.setMastered(id, req.mastered());
    }
}
