package com.example.studyhelper.exam;

import com.example.studyhelper.common.Periods;
import com.example.studyhelper.review.ReviewPlanRepository;
import com.example.studyhelper.timetable.SubjectConfigRepository;
import com.example.studyhelper.timetable.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExamService {

    public record WrongDto(Long id, Long paperId, String subject, String semester, String unit, String type,
                           String date, String content, String reason, boolean mastered,
                           boolean deleted, String deletedAt, Integer reviewStage) {}
    public record AddWrongRequest(String subject, String semester, String unit, String content, String reason) {}
    public record PaperDto(Long id, String subject, String unit, String type, String date, double score,
                           double fullScore, List<String> reasons, boolean hasPhoto, List<WrongDto> wrongs) {}
    public record WrongInput(String content, String reason) {}
    public record CreatePaperRequest(String subject, String unit, String type, java.time.LocalDate date, Double score,
                                     Double fullScore, List<String> reasons, List<WrongInput> wrongs) {}
    public record ReorderRequest(List<Long> ids) {}
    public record SubjectStat(String subject, double avg, int n, double target) {}
    public record AnalysisDto(List<SubjectStat> subjects, SubjectStat weak, List<String> days,
                              Map<String, Integer> reasonTally) {}

    private final PaperRepository paperRepo;
    private final WrongQuestionRepository wrongRepo;
    private final TimetableSlotRepository slotRepo;
    private final ReviewPlanRepository reviewPlanRepo;
    private final SubjectConfigRepository subjectConfigRepo;

    public ExamService(PaperRepository paperRepo, WrongQuestionRepository wrongRepo,
                       TimetableSlotRepository slotRepo, ReviewPlanRepository reviewPlanRepo,
                       SubjectConfigRepository subjectConfigRepo) {
        this.paperRepo = paperRepo;
        this.wrongRepo = wrongRepo;
        this.slotRepo = slotRepo;
        this.reviewPlanRepo = reviewPlanRepo;
        this.subjectConfigRepo = subjectConfigRepo;
    }

    @Transactional(readOnly = true)
    public List<PaperDto> list() {
        return paperRepo.findAllByOrderBySortOrderAscExamDateDescIdDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public void reorder(List<Long> ids) {
        int i = 1;
        for (Long id : ids) {
            var p = paperRepo.findById(id).orElse(null);
            if (p != null) {
                p.setSortOrder(i);
                i++;
            }
        }
    }

    @Transactional
    public PaperDto create(CreatePaperRequest req) {
        if (req.subject() == null || req.subject().isBlank()
                || req.unit() == null || req.unit().isBlank()
                || req.type() == null || req.date() == null) {
            throw new IllegalArgumentException("科目 / 单元 / 类型 / 日期不能为空");
        }
        double full = req.fullScore() == null ? 100 : req.fullScore();
        double score = req.score() == null ? 0 : req.score();
        if (score < 0 || score > full) throw new IllegalArgumentException("得分需在 0 到 " + full + " 之间");
        var p = new Paper();
        p.setSubject(req.subject().trim());
        p.setUnit(req.unit().trim());
        p.setExamType(req.type());
        p.setExamDate(req.date());
        p.setScore(score);
        p.setFullScore(full);
        p.setReasons(req.reasons() == null ? "" : String.join(",", req.reasons()));
        p.setHasPhoto(false);
        paperRepo.save(p);
        if (req.wrongs() != null) {
            for (WrongInput w : req.wrongs()) {
                if (w.content() == null || w.content().isBlank()) continue;
                var e = new WrongQuestion();
                e.setPaper(p);
                e.setSubject(p.getSubject());
                e.setSemester("三年级上");
                e.setUnit(p.getUnit());
                e.setExamType(p.getExamType());
                e.setExamDate(p.getExamDate());
                e.setContent(w.content().trim());
                e.setReason(w.reason() == null || w.reason().isBlank() ? "没掌握" : w.reason());
                wrongRepo.save(e);
            }
        }
        return toDto(p);
    }

    @Transactional
    public PaperDto update(Long id, CreatePaperRequest req) {
        var p = paperRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("试卷不存在"));
        if (req.subject() == null || req.subject().isBlank()
                || req.unit() == null || req.unit().isBlank()
                || req.type() == null || req.date() == null) {
            throw new IllegalArgumentException("科目 / 单元 / 类型 / 日期不能为空");
        }
        double full = req.fullScore() == null ? 100 : req.fullScore();
        double score = req.score() == null ? 0 : req.score();
        if (score < 0 || score > full) throw new IllegalArgumentException("得分需在 0 到 " + full + " 之间");
        p.setSubject(req.subject().trim());
        p.setUnit(req.unit().trim());
        p.setExamType(req.type());
        p.setExamDate(req.date());
        p.setScore(score);
        p.setFullScore(full);
        p.setReasons(req.reasons() == null ? "" : String.join(",", req.reasons()));
        // 同步该卷错题的冗余字段（科目/单元/类型/日期随卷更新）
        for (var w : wrongRepo.findByPaperIdOrderByIdAsc(id)) {
            w.setSubject(p.getSubject());
            w.setUnit(p.getUnit());
            w.setExamType(p.getExamType());
            w.setExamDate(p.getExamDate());
        }
        return toDto(p);
    }

    @Transactional
    public void deletePaper(Long id) {
        var wrongs = wrongRepo.findByPaperIdOrderByIdAsc(id);
        for (var w : wrongs) reviewPlanRepo.deleteByWrongId(w.getId());
        wrongRepo.deleteAll(wrongs);
        paperRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<WrongDto> wrongs(String subject, String semester) {
        return wrongRepo.findAllByOrderByIdDesc().stream()
                .filter(w -> !w.isDeleted())
                .filter(w -> subject == null || subject.isBlank() || "全部".equals(subject) || w.getSubject().equals(subject))
                .filter(w -> semester == null || semester.isBlank() || w.getSemester().equals(semester))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WrongDto> trash() {
        return wrongRepo.findByDeletedTrue().stream()
                .sorted(Comparator.comparing(WrongQuestion::getDeletedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public WrongDto addManual(AddWrongRequest req) {
        if (req.subject() == null || req.subject().isBlank()) throw new IllegalArgumentException("请选择科目");
        if (req.content() == null || req.content().isBlank()) throw new IllegalArgumentException("请填写薄弱知识点内容");
        var w = new WrongQuestion();
        w.setSubject(req.subject().trim());
        w.setSemester(req.semester() == null || req.semester().isBlank() ? "三年级上" : req.semester().trim());
        w.setUnit(req.unit() == null || req.unit().isBlank() ? null : req.unit().trim());
        w.setExamType(null);
        w.setExamDate(null);
        w.setContent(req.content().trim());
        w.setReason(req.reason() == null || req.reason().isBlank() ? "没掌握" : req.reason());
        wrongRepo.save(w);
        return toDto(w);
    }

    @Transactional
    public void deleteWrong(Long id) {
        var w = wrongRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("错题不存在"));
        w.setDeleted(true);
        w.setDeletedAt(java.time.LocalDateTime.now());
    }

    @Transactional
    public WrongDto restoreWrong(Long id) {
        var w = wrongRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("错题不存在"));
        if (!w.isDeleted()) throw new IllegalArgumentException("该条目不在废纸篓中");
        w.setDeleted(false);
        w.setDeletedAt(null);
        return toDto(w);
    }

    @Transactional
    public void deleteWrongPermanent(Long id) {
        var w = wrongRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("错题不存在"));
        if (!w.isDeleted()) throw new IllegalArgumentException("请先移入废纸篓");
        reviewPlanRepo.deleteByWrongId(id);
        wrongRepo.delete(w);
    }

    @Transactional
    public int emptyTrash() {
        var list = wrongRepo.findByDeletedTrue();
        int n = list.size();
        for (var w : list) reviewPlanRepo.deleteByWrongId(w.getId());
        wrongRepo.deleteAll(list);
        return n;
    }

    @Transactional
    public WrongDto setMastered(Long id, boolean mastered) {
        var w = wrongRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("错题不存在"));
        w.setMastered(mastered);
        return toDto(w);
    }

    @Transactional(readOnly = true)
    public AnalysisDto analysis() {
        Map<String, List<Paper>> by = new HashMap<>();
        for (Paper p : paperRepo.findAll()) by.computeIfAbsent(p.getSubject(), k -> new ArrayList<>()).add(p);
        Map<String, Double> targets = new HashMap<>();
        java.util.Set<String> examSubjects = new java.util.HashSet<>();
        subjectConfigRepo.findAll().forEach(c -> {
            targets.put(c.getSubject(), c.getTarget());
            if (c.isHasExam()) examSubjects.add(c.getSubject());
        });
        List<SubjectStat> stats = by.entrySet().stream()
                .filter(e -> examSubjects.isEmpty() || examSubjects.contains(e.getKey()))
                .map(e -> {
            var arr = e.getValue().stream().sorted(Comparator.comparing(Paper::getExamDate)).toList();
            int n = Math.min(3, arr.size());
            double avg = arr.subList(arr.size() - n, arr.size()).stream()
                    .mapToDouble(p -> p.getScore() / (p.getFullScore() == 0 ? 100 : p.getFullScore()) * 100)
                    .average().orElse(0);
            double target = targets.getOrDefault(e.getKey(), 90.0);
            return new SubjectStat(e.getKey(), Math.round(avg * 10) / 10.0, n, target);
        }).toList();
        // 薄弱科目 = 距各自目标差距最大的科目
        SubjectStat weak = stats.isEmpty() ? null
                : stats.stream().max(Comparator.comparingDouble(s -> s.target() - s.avg())).orElse(null);
        List<String> days = weak == null ? List.of()
                : slotRepo.findByDayOfWeekBetweenAndSubject(1, 5, weak.subject()).stream()
                        .map(s -> Periods.DAYS[s.getDayOfWeek()]).distinct().toList();
        Map<String, Integer> tally = new LinkedHashMap<>();
        tally.put("粗心", 0);
        tally.put("没掌握", 0);
        tally.put("没复习", 0);
        tally.put("时间不够", 0);
        for (Paper p : paperRepo.findAll()) {
            for (String r : p.getReasons().split(",")) {
                String key = r.trim();
                if (!key.isEmpty() && tally.containsKey(key)) tally.merge(key, 1, Integer::sum);
            }
        }
        return new AnalysisDto(stats, weak, days, tally);
    }

    private PaperDto toDto(Paper p) {
        List<String> reasons = new ArrayList<>();
        for (String r : p.getReasons().split(",")) {
            if (!r.isBlank()) reasons.add(r.trim());
        }
        var wrongs = wrongRepo.findByPaperIdOrderByIdAsc(p.getId()).stream().map(this::toDto).toList();
        return new PaperDto(p.getId(), p.getSubject(), p.getUnit(), p.getExamType(), p.getExamDate().toString(),
                p.getScore(), p.getFullScore(), reasons, p.isHasPhoto(), wrongs);
    }

    private WrongDto toDto(WrongQuestion w) {
        Integer reviewStage = reviewPlanRepo.findByWrongIdAndGraduatedFalse(w.getId())
                .map(p -> p.getDoneCount() + 1).orElse(null);
        return new WrongDto(w.getId(), w.getPaper() == null ? null : w.getPaper().getId(), w.getSubject(),
                w.getSemester(), w.getUnit(), w.getExamType(),
                w.getExamDate() == null ? null : w.getExamDate().toString(),
                w.getContent(), w.getReason(), w.isMastered(),
                w.isDeleted(), w.getDeletedAt() == null ? null : w.getDeletedAt().toString(), reviewStage);
    }
}
