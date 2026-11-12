package com.example.studyhelper.today;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TodayController {

    private final TodayService service;

    public TodayController(TodayService service) { this.service = service; }

    @GetMapping("/today")
    public TodayService.TodayDto today() {
        return service.today();
    }

    @GetMapping("/calendar")
    public TodayService.MonthCalendarDto calendar(@RequestParam String month) {
        return service.monthCalendar(java.time.YearMonth.parse(month));
    }

    @GetMapping("/day/{date}")
    public TodayService.TodayDto day(@PathVariable java.time.LocalDate date) {
        return service.dayView(date);
    }

    @PostMapping("/today/extra-course")
    public TodayService.TodayDto addExtraCourse(@RequestBody TodayService.AddExtraRequest req) {
        return service.addExtraCourse(req);
    }

    @DeleteMapping("/today/extra-course/{slotId}")
    public void removeExtraCourse(@PathVariable Long slotId) {
        service.removeExtraCourse(slotId);
    }
}
