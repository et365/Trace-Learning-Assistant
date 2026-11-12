package com.example.studyhelper.routine;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RoutineService {

    public record RoutineDto(Long id, String name, boolean enabled, boolean doneToday) {}
    public record UpsertRoutineRequest(String name, Boolean enabled) {}
    public record SetDoneRequest(boolean done) {}

    private final RoutineRepository routineRepo;
    private final RoutineLogRepository logRepo;

    public RoutineService(RoutineRepository routineRepo, RoutineLogRepository logRepo) {
        this.routineRepo = routineRepo;
        this.logRepo = logRepo;
    }

    @Transactional(readOnly = true)
    public List<RoutineDto> todayList() {
        LocalDate today = LocalDate.now();
        return routineRepo.findAllByOrderByIdAsc().stream()
                .map(r -> new RoutineDto(r.getId(), r.getName(), r.isEnabled(),
                        logRepo.findByRoutineIdAndDoneDate(r.getId(), today).isPresent()))
                .toList();
    }

    @Transactional
    public RoutineDto create(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("请填写必做项名称");
        var r = new DailyRoutine();
        r.setName(name.trim());
        routineRepo.save(r);
        return toDto(r, false);
    }

    @Transactional
    public RoutineDto update(Long id, UpsertRoutineRequest req) {
        var r = routineRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("必做项不存在"));
        if (req.name() != null) {
            if (req.name().isBlank()) throw new IllegalArgumentException("名称不能为空");
            r.setName(req.name().trim());
        }
        if (req.enabled() != null) r.setEnabled(req.enabled());
        return toDto(r, isDoneToday(id));
    }

    @Transactional
    public void delete(Long id) {
        routineRepo.deleteById(id);
        logRepo.deleteByRoutineId(id);
    }

    @Transactional
    public RoutineDto setDone(Long id, boolean done) {
        var r = routineRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("必做项不存在"));
        LocalDate today = LocalDate.now();
        var existing = logRepo.findByRoutineIdAndDoneDate(id, today);
        if (done && existing.isEmpty()) {
            var log = new RoutineLog();
            log.setRoutineId(id);
            log.setDoneDate(today);
            logRepo.save(log);
        } else if (!done) {
            existing.ifPresent(logRepo::delete);
        }
        return toDto(r, done && existing.isEmpty() || (existing.isPresent() && done));
    }

    private boolean isDoneToday(Long id) {
        return logRepo.findByRoutineIdAndDoneDate(id, LocalDate.now()).isPresent();
    }

    private RoutineDto toDto(DailyRoutine r, boolean doneToday) {
        return new RoutineDto(r.getId(), r.getName(), r.isEnabled(), doneToday);
    }
}
