package com.example.studyhelper.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReviewPlanRepository extends JpaRepository<ReviewPlan, Long> {
    List<ReviewPlan> findByGraduatedFalseAndNextDateLessThanEqual(LocalDate date);
    List<ReviewPlan> findByGraduatedFalse();
    List<ReviewPlan> findByLastDate(LocalDate date);
    Optional<ReviewPlan> findByWrongIdAndGraduatedFalse(Long wrongId);
    void deleteByWrongId(Long wrongId);
}
