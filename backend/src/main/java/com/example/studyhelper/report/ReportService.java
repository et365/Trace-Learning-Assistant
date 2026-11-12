package com.example.studyhelper.report;

import com.example.studyhelper.common.Periods;
import com.example.studyhelper.exam.ExamService;
import com.example.studyhelper.reward.StarLedgerRepository;
import com.example.studyhelper.timetable.SlotItemRepository;
import com.example.studyhelper.timetable.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    public record LessonEntryDto(String periodName, String subject, String lesson) {}
    public record DayLessonsDto(String day, List<LessonEntryDto> entries) {}
    public record MasteryStat(String subject, int pct) {}
    public record ExamSummary(String weakSubject, Double weakAvg, String others, String summary) {}
    public record ReportDto(int completionRate, long itemsTotal, long itemsDone, long checkinDays,
                            int starsThisWeek, List<MasteryStat> mastery, ExamSummary exam) {}

    private final TimetableSlotRepository slotRepo;
    private final SlotItemRepository itemRepo;
    private final StarLedgerRepository ledgerRepo;
    private final ExamService examService;

    public ReportService(TimetableSlotRepository slotRepo, SlotItemRepository itemRepo,
                         StarLedgerRepository ledgerRepo, ExamService examService) {
        this.slotRepo = slotRepo;
        this.itemRepo = itemRepo;
        this.ledgerRepo = ledgerRepo;
        this.examService = examService;
    }

    @Transactional(readOnly = true)
    public List<DayLessonsDto> lessonsWeek() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate friday = monday.plusDays(4);
        var result = new ArrayList<DayLessonsDto>();
        for (int d = 1; d <= 5; d++) {
            var entries = slotRepo.findByDayOfWeekOrderByPeriodIndexAsc(d).stream()
                    .filter(s -> !s.isExtra() || (s.getExtraDate() != null
                            && !s.getExtraDate().isBefore(monday) && !s.getExtraDate().isAfter(friday)))
                    .filter(s -> !s.getLesson().isBlank())
                    .map(s -> new LessonEntryDto(Periods.period(s.getPeriodIndex()).name(), s.getSubject(), s.getLesson()))
                    .toList();
            if (!entries.isEmpty()) result.add(new DayLessonsDto(Periods.DAYS[d], entries));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public ReportDto weekReport() {
        LocalDateTime weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        long total = itemRepo.countWeekItems();
        long done = itemRepo.countWeekDoneItems();
        long checkin = itemRepo.countCheckinDaysSince(weekStart);
        int stars = ledgerRepo.sumSince(weekStart);
        LocalDate monday = weekStart.toLocalDate();

        Map<String, int[]> acc = new LinkedHashMap<>();
        for (var s : slotRepo.findByDayOfWeekBetweenAndMasteryGreaterThan(1, 5, 0)) {
            if (s.isExtra() && (s.getExtraDate() == null || s.getExtraDate().isBefore(monday))) continue;
            var a = acc.computeIfAbsent(s.getSubject(), k -> new int[2]);
            a[0] += s.getMastery();
            a[1] += 1;
        }
        List<String> order = List.of("语文", "数学", "英语", "科学");
        List<MasteryStat> mastery = acc.entrySet().stream()
                .sorted(Comparator.comparingInt(e -> {
                    int i = order.indexOf(e.getKey());
                    return i < 0 ? 99 : i;
                }))
                .map(e -> new MasteryStat(e.getKey(), (int) Math.round(e.getValue()[0] / (double) e.getValue()[1] / 5 * 100)))
                .toList();

        var a = examService.analysis();
        String weakSubject = a.weak() == null ? null : a.weak().subject();
        Double weakAvg = a.weak() == null ? null : a.weak().avg();
        String others = a.subjects().stream().skip(1)
                .map(s -> s.subject() + " " + String.format("%.0f", s.avg()) + " 分")
                .reduce((x, y) -> x + "、" + y).orElse("");
        String summary = a.weak() == null ? "暂无考试数据"
                : "需要重点关注 " + weakSubject + "（近 " + a.weak().n() + " 次平均 " + weakAvg + " 分）"
                + (others.isEmpty() ? "" : "；" + others + "，表现平稳。");
        var exam = new ExamSummary(weakSubject, weakAvg, others, summary);

        int rate = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        return new ReportDto(rate, total, done, checkin, stars, mastery, exam);
    }
}
