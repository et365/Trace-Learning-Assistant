package com.example.studyhelper.routine;

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
@RequestMapping("/api/routines")
public class RoutineController {

    public record SetDoneRequest(boolean done) {}

    private final RoutineService service;

    public RoutineController(RoutineService service) { this.service = service; }

    @GetMapping
    public List<RoutineService.RoutineDto> list() {
        return service.todayList();
    }

    @PostMapping
    public RoutineService.RoutineDto create(@RequestBody RoutineService.UpsertRoutineRequest req) {
        return service.create(req.name());
    }

    @PutMapping("/{id}")
    public RoutineService.RoutineDto update(@PathVariable Long id, @RequestBody RoutineService.UpsertRoutineRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/done")
    public RoutineService.RoutineDto setDone(@PathVariable Long id, @RequestBody SetDoneRequest req) {
        return service.setDone(id, req.done());
    }
}
