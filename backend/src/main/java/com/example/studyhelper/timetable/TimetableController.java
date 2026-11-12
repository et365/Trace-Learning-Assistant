package com.example.studyhelper.timetable;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TimetableController {

    public record SetDoneRequest(boolean done) {}

    private final TimetableService service;

    public TimetableController(TimetableService service) { this.service = service; }

    @GetMapping("/timetable")
    public Map<String, Object> timetable() {
        return Map.of(
                "slots", service.timetable(),
                "subjects", List.of("语文", "数学", "英语", "科学", "体育", "美术", "音乐", "道法", "班会", "自习"));
    }

    @GetMapping("/slots/{id}")
    public TimetableService.SlotDto slot(@PathVariable Long id) {
        return service.slot(id);
    }

    @PutMapping("/slots/{id}")
    public TimetableService.SlotDto update(@PathVariable Long id, @RequestBody TimetableService.UpdateSlotRequest req) {
        return service.updateSlot(id, req);
    }

    @PostMapping("/slots/{id}/items")
    public TimetableService.SlotDto addItem(@PathVariable Long id, @RequestBody TimetableService.AddItemRequest req) {
        return service.addItem(id, req);
    }

    @PutMapping("/slot-items/{id}")
    public TimetableService.SlotDto updateItem(@PathVariable Long id, @RequestBody TimetableService.UpdateItemRequest req) {
        return service.updateItem(id, req);
    }

    @DeleteMapping("/slots/{id}")
    public void deleteSlot(@PathVariable Long id) {
        service.deleteSlot(id);
    }

    @PatchMapping("/slot-items/{id}")
    public Map<String, Object> setDone(@PathVariable Long id, @RequestBody SetDoneRequest req) {
        return service.setItemDone(id, req.done());
    }

    @DeleteMapping("/slot-items/{id}")
    public Map<String, Object> deleteItem(@PathVariable Long id) {
        return service.deleteItem(id);
    }
}
