package com.example.studyhelper.timetable;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findByDayOfWeekOrderByPeriodIndexAsc(int dayOfWeek);
    List<TimetableSlot> findByDayOfWeekAndExtraFalseOrderByPeriodIndexAsc(int dayOfWeek);
    List<TimetableSlot> findByExtraTrueAndExtraDateOrderByPeriodIndexAsc(java.time.LocalDate date);
    List<TimetableSlot> findAllByExtraFalseOrderByDayOfWeekAscPeriodIndexAsc();
    List<TimetableSlot> findByDayOfWeekBetweenAndSubject(int from, int to, String subject);
    List<TimetableSlot> findByDayOfWeekBetweenAndMasteryGreaterThan(int from, int to, int mastery);
}
