package com.example.studyhelper.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) { this.service = service; }

    @GetMapping("/lessons/week")
    public List<ReportService.DayLessonsDto> lessonsWeek() {
        return service.lessonsWeek();
    }

    @GetMapping("/report/week")
    public ReportService.ReportDto weekReport() {
        return service.weekReport();
    }
}
