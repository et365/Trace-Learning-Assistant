package com.example.studyhelper.routine;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoutineLogRepository extends JpaRepository<RoutineLog, Long> {
    Optional<RoutineLog> findByRoutineIdAndDoneDate(Long routineId, LocalDate doneDate);
    List<RoutineLog> findByDoneDate(LocalDate doneDate);
    void deleteByRoutineId(Long routineId);
}
