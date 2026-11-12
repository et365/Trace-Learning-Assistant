package com.example.studyhelper.today;

import com.example.studyhelper.common.Periods;
import com.example.studyhelper.reward.RewardService;
import com.example.studyhelper.timetable.SlotItem;
import com.example.studyhelper.timetable.TimetableSlot;
import com.example.studyhelper.timetable.SubjectConfig;
import com.example.studyhelper.timetable.SubjectConfigRepository;
import com.example.studyhelper.timetable.TimetableService.SlotItemDto;
import com.example.studyhelper.timetable.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TodayService {

    public record TaskDto(Long slotId, String subject, String periodName, String time, String lesson,
                          int mastery, String note, List<SlotItemDto> items, boolean noHomework, boolean extra,
                          int doneItems, int totalItems, int status) {}
    public record AddExtraRequest(String subject, Integer periodIndex) {}
    public record TodayDto(String dayLabel, boolean weekend, List<TaskDto> tasks,
                           int doneCount, int totalCount, int stars) {}
    public record CalDay(String date, boolean hasRecord) {}
    public record MonthCalendarDto(String month, List<CalDay> days) {}

    private final TimetableSlotRepository slotRepo;
    private final SubjectConfigRepository subjectConfigRepo;
    private final RewardService rewardService;

    public TodayService(TimetableSlotRepository slotRepo, SubjectConfigRepository subjectConfigRepo,
                        RewardService rewardService) {
        this.slotRepo = slotRepo;
        this.subjectConfigRepo = subjectConfigRepo;
        this.rewardService = rewardService;
    }

    @Transactional(readOnly = true)
    public TodayDto today() {
        LocalDate today = LocalDate.now();
        int dow = today.getDayOfWeek().getValue();
        return dayView(today, dow > 5 ? 5 : dow, dow > 5);
    }

    @Transactional(readOnly = true)
    public TodayDto dayView(java.time.LocalDate date) {
        int dow = date.getDayOfWeek().getValue();
        return dayView(date, dow > 5 ? 5 : dow, dow > 5);
    }

    private TodayDto dayView(LocalDate date, int day, boolean weekend) {
        var noHomeworkSubjects = new java.util.HashSet<String>();
        for (SubjectConfig c : subjectConfigRepo.findAll()) {
            if (c.isNoHomework()) noHomeworkSubjects.add(c.getSubject());
        }
        var all = new ArrayList<TimetableSlot>();
        slotRepo.findByDayOfWeekAndExtraFalseOrderByPeriodIndexAsc(day).stream()
                .filter(s -> s.getPeriodIndex() >= 1)
                .filter(s -> !noHomeworkSubjects.contains(s.getSubject()))
                .forEach(all::add);
        slotRepo.findByExtraTrueAndExtraDateOrderByPeriodIndexAsc(date).forEach(all::add);
        all.sort(Comparator.comparingInt(TimetableSlot::getPeriodIndex));

        var tasks = all.stream()
                .map(s -> {
                    var p = Periods.period(s.getPeriodIndex());
                    int total = s.getItems().size();
                    int done = (int) s.getItems().stream().filter(SlotItem::isDone).count();
                    int status = s.isNoHomework() ? 3 : (total == 0 ? 0 : (done == total ? 2 : (done > 0 ? 1 : 0)));
                    var items = s.getItems().stream()
                            .map(i -> new SlotItemDto(i.getId(), i.getItemType(), Periods.typeLabel(i.getItemType()),
                                    i.getContent(), i.getNote(), i.isDone()))
                            .toList();
                    return new TaskDto(s.getId(), s.getSubject(), p.name(), p.time(), s.getLesson(),
                            s.getMastery(), s.getNote(), items, s.isNoHomework(), s.isExtra(), done, total, status);
                }).toList();
        int doneCount = (int) tasks.stream().filter(t -> t.status() == 2 || t.status() == 3).count();
        String dayLabel = date.getMonthValue() + "月" + date.getDayOfMonth() + "日 " + Periods.DAYS[day];
        return new TodayDto(dayLabel, weekend, tasks, doneCount, tasks.size(), rewardService.balance());
    }

    @Transactional(readOnly = true)
    public MonthCalendarDto monthCalendar(java.time.YearMonth month) {
        var days = new ArrayList<CalDay>();
        for (LocalDate d = month.atDay(1); !d.isAfter(month.atEndOfMonth()); d = d.plusDays(1)) {
            days.add(new CalDay(d.toString(), hasRecord(d)));
        }
        return new MonthCalendarDto(month.toString(), days);
    }

    private boolean hasRecord(LocalDate d) {
        LocalDate today = LocalDate.now();
        if (d.isAfter(today)) return false; // 未来日期不会有记录
        int day = d.getDayOfWeek().getValue();
        for (var s : slotRepo.findByDayOfWeekOrderByPeriodIndexAsc(day)) {
            if (s.isExtra() && !d.equals(s.getExtraDate())) continue;
            // 当天有打卡行为（按完成时间归属日期）
            for (var it : s.getItems()) {
                if (it.isDone() && it.getCompletedAt() != null && it.getCompletedAt().toLocalDate().equals(d)) {
                    return true;
                }
            }
            // 所学/自评/疑问/无作业属于“当前状态”，归入今天
            if (d.equals(today) && (!s.getLesson().isBlank() || s.getMastery() > 0
                    || !s.getNote().isBlank() || s.isNoHomework())) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public TodayDto addExtraCourse(AddExtraRequest req) {
        if (req.subject() == null || req.subject().isBlank()) throw new IllegalArgumentException("请选择科目");
        int period = req.periodIndex() == null ? 6 : req.periodIndex();
        if (period < 0 || period >= Periods.ALL.size()) throw new IllegalArgumentException("节次不合法");
        LocalDate today = LocalDate.now();
        int dow = today.getDayOfWeek().getValue();
        var slot = new com.example.studyhelper.timetable.TimetableSlot();
        slot.setDayOfWeek(dow > 5 ? 5 : dow);
        slot.setPeriodIndex(period);
        slot.setSubject(req.subject().trim());
        slot.setExtra(true);
        slot.setExtraDate(today);
        slotRepo.save(slot);
        return today();
    }

    @Transactional
    public void removeExtraCourse(Long slotId) {
        var s = slotRepo.findById(slotId).orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        if (!s.isExtra()) throw new IllegalArgumentException("只有临时添加的课程可以移除");
        slotRepo.delete(s);
    }
}
