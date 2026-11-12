package com.example.studyhelper.review;

import com.example.studyhelper.exam.WrongQuestion;
import com.example.studyhelper.exam.WrongQuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ReviewService {

    public record ReviewDto(Long id, Long wrongId, String subject, String content, String unit, String reason,
                            int round, int passRequired, int doneCount, String nextDate, boolean due,
                            boolean reviewedToday, String outcome) {}
    public record StartRequest(Long wrongId) {}

    private static final int[] INTERVALS_AFTER = {1, 2, 4}; // 通过后间隔：1天 → 2天 → 4天
    private static final int PASS_REQUIRED = 3;

    private final ReviewPlanRepository planRepo;
    private final WrongQuestionRepository wrongRepo;

    public ReviewService(ReviewPlanRepository planRepo, WrongQuestionRepository wrongRepo) {
        this.planRepo = planRepo;
        this.wrongRepo = wrongRepo;
    }

    /** 今日复习区：到期未复习的（可操作）+ 今天已复习的（展示结果，不再无声消失） */
    @Transactional(readOnly = true)
    public List<ReviewDto> todaySection() {
        LocalDate today = LocalDate.now();
        var out = new ArrayList<ReviewDto>();
        for (var p : planRepo.findByGraduatedFalseAndNextDateLessThanEqual(today)) {
            var w = wrongRepo.findById(p.getWrongId()).orElse(null);
            if (w == null || w.isDeleted() || w.isMastered()) continue;
            out.add(toDto(p, w, true, false, null));
        }
        for (var p : planRepo.findByLastDate(today)) {
            var w = wrongRepo.findById(p.getWrongId()).orElse(null);
            if (w == null || w.isDeleted()) continue;
            String outcome = p.isGraduated() ? "graduated"
                    : (p.getStage() == 0 && p.getDoneCount() == 0 ? "fail" : "pass");
            out.add(toDto(p, w, false, true, outcome));
        }
        out.sort(Comparator.comparing(ReviewDto::id));
        return out;
    }

    /** 所有进行中的计划（供错题本标记「复习中」） */
    @Transactional(readOnly = true)
    public Set<Long> activeWrongIds() {
        var out = new HashSet<Long>();
        for (var p : planRepo.findByGraduatedFalse()) out.add(p.getWrongId());
        return out;
    }

    /** 开启间隔重复：首次复习就在当天 */
    @Transactional
    public ReviewDto start(Long wrongId) {
        var w = wrongRepo.findById(wrongId).orElseThrow(() -> new IllegalArgumentException("错题不存在"));
        if (w.isDeleted()) throw new IllegalArgumentException("该条目在废纸篓中，请先恢复");
        if (w.isMastered()) throw new IllegalArgumentException("已掌握的条目无需复习");
        planRepo.findByWrongIdAndGraduatedFalse(wrongId).ifPresent(p -> {
            throw new IllegalArgumentException("该错题已在复习计划中");
        });
        var p = new ReviewPlan();
        p.setWrongId(wrongId);
        p.setStartDate(LocalDate.now());
        p.setNextDate(LocalDate.now());
        planRepo.save(p);
        p.setLastDate(null);
        return toDto(p, w, true, false, null);
    }

    /** 通过：次数+1；满 3 次自动毕业并关闭该未掌握知识点 */
    @Transactional
    public ReviewDto pass(Long id) {
        var p = planRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("复习计划不存在"));
        if (p.isGraduated()) throw new IllegalArgumentException("该计划已毕业");
        var w = wrongRepo.findById(p.getWrongId()).orElseThrow(() -> new IllegalArgumentException("关联错题不存在"));
        p.setDoneCount(p.getDoneCount() + 1);
        p.setLastDate(LocalDate.now());
        if (p.getDoneCount() >= PASS_REQUIRED) {
            p.setGraduated(true);
            w.setMastered(true); // 自动关闭该未掌握知识点
        } else {
            int idx = Math.min(p.getStage(), INTERVALS_AFTER.length - 1);
            p.setStage(idx + 1);
            p.setNextDate(LocalDate.now().plusDays(INTERVALS_AFTER[idx]));
        }
        return toDto(p, w, false, true, null);
    }

    /** 未掌握：回到第 1 阶段，明天再来 */
    @Transactional
    public ReviewDto fail(Long id) {
        var p = planRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("复习计划不存在"));
        var w = wrongRepo.findById(p.getWrongId()).orElseThrow(() -> new IllegalArgumentException("关联错题不存在"));
        p.setStage(0);
        p.setDoneCount(0);
        p.setLastDate(LocalDate.now());
        p.setNextDate(LocalDate.now().plusDays(1));
        return toDto(p, w, false, true, "fail");
    }

    /** 取消计划 */
    @Transactional
    public void cancel(Long id) {
        planRepo.deleteById(id);
    }

    private ReviewDto toDto(ReviewPlan p, WrongQuestion w, boolean due, boolean reviewedToday, String outcome) {
        return new ReviewDto(p.getId(), p.getWrongId(), w.getSubject(), w.getContent(), w.getUnit(), w.getReason(),
                p.getDoneCount() + 1, PASS_REQUIRED, p.getDoneCount(),
                p.getNextDate().toString(), due, reviewedToday, outcome);
    }
}
