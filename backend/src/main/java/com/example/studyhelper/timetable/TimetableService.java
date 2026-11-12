package com.example.studyhelper.timetable;

import com.example.studyhelper.common.Periods;
import com.example.studyhelper.reward.RewardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TimetableService {

    public record SlotItemDto(Long id, String type, String typeLabel, String content, String note, boolean done) {}
    public record SlotDto(Long id, int dayOfWeek, String dayName, int periodIndex, String periodName, String time,
                          String subject, String lesson, int mastery, String note,
                          List<SlotItemDto> items, boolean hasPlan, boolean noHomework) {}
    public record UpdateSlotRequest(String subject, String lesson, Integer mastery, String note, Boolean noHomework) {}
    public record AddItemRequest(String type, String content, String note) {}
    public record UpdateItemRequest(String type, String content, String note) {}

    private final TimetableSlotRepository slotRepo;
    private final SlotItemRepository itemRepo;
    private final RewardService rewardService;

    public TimetableService(TimetableSlotRepository slotRepo, SlotItemRepository itemRepo, RewardService rewardService) {
        this.slotRepo = slotRepo;
        this.itemRepo = itemRepo;
        this.rewardService = rewardService;
    }

    @Transactional(readOnly = true)
    public List<SlotDto> timetable() {
        return slotRepo.findAllByExtraFalseOrderByDayOfWeekAscPeriodIndexAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SlotDto slot(Long id) {
        return toDto(get(id));
    }

    @Transactional
    public SlotDto updateSlot(Long id, UpdateSlotRequest req) {
        var s = get(id);
        if (req.subject() != null) s.setSubject(req.subject());
        if (req.lesson() != null) s.setLesson(req.lesson());
        if (req.mastery() != null) s.setMastery(Math.max(0, Math.min(5, req.mastery())));
        if (req.note() != null) s.setNote(req.note());
        if (req.noHomework() != null) s.setNoHomework(req.noHomework());
        return toDto(s);
    }

    @Transactional
    public SlotDto addItem(Long slotId, AddItemRequest req) {
        String type = req.type() == null ? "" : req.type();
        if (!List.of("T", "F", "K").contains(type)) throw new IllegalArgumentException("作业类型不合法");
        if (req.content() == null || req.content().isBlank()) throw new IllegalArgumentException("内容不能为空");
        var s = get(slotId);
        var item = new SlotItem();
        item.setSlot(s);
        item.setItemType(type);
        item.setContent(req.content().trim());
        item.setNote(req.note() == null ? "" : req.note().trim());
        s.getItems().add(item);
        s.setNoHomework(false);
        return toDto(s);
    }

    @Transactional
    public SlotDto updateItem(Long itemId, UpdateItemRequest req) {
        var item = itemRepo.findById(itemId).orElseThrow(() -> new IllegalArgumentException("条目不存在"));
        if (req.type() != null) {
            if (!List.of("T", "F", "K").contains(req.type())) throw new IllegalArgumentException("作业类型不合法");
            item.setItemType(req.type());
        }
        if (req.content() != null) {
            if (req.content().isBlank()) throw new IllegalArgumentException("内容不能为空");
            item.setContent(req.content().trim());
        }
        if (req.note() != null) item.setNote(req.note().trim());
        return toDto(item.getSlot());
    }

    @Transactional
    public void deleteSlot(Long id) {
        var s = get(id);
        if (!s.isExtra()) throw new IllegalArgumentException("固定课表课程不能删除");
        slotRepo.delete(s);
    }

    @Transactional
    public Map<String, Object> setItemDone(Long itemId, boolean done) {
        var item = itemRepo.findById(itemId).orElseThrow(() -> new IllegalArgumentException("条目不存在"));
        if (item.isDone() != done) {
            item.setDone(done);
            item.setCompletedAt(done ? LocalDateTime.now() : null);
            rewardService.add((done ? "完成：" : "撤销：") + item.getContent(), done ? 1 : -1);
        }
        return Map.of("stars", rewardService.balance());
    }

    @Transactional
    public Map<String, Object> deleteItem(Long itemId) {
        itemRepo.deleteById(itemId);
        return Map.of("stars", rewardService.balance());
    }

    private TimetableSlot get(Long id) {
        return slotRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("课程不存在"));
    }

    private SlotDto toDto(TimetableSlot s) {
        var p = Periods.period(s.getPeriodIndex());
        var items = s.getItems().stream()
                .map(i -> new SlotItemDto(i.getId(), i.getItemType(), Periods.typeLabel(i.getItemType()),
                        i.getContent(), i.getNote(), i.isDone()))
                .toList();
        boolean hasPlan = (s.getLesson() != null && !s.getLesson().isBlank()) || !items.isEmpty();
        return new SlotDto(s.getId(), s.getDayOfWeek(), Periods.DAYS[s.getDayOfWeek()], s.getPeriodIndex(),
                p.name(), p.time(), s.getSubject(), s.getLesson(), s.getMastery(), s.getNote(), items, hasPlan, s.isNoHomework());
    }
}
