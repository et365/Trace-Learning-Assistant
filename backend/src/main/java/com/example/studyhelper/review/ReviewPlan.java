package com.example.studyhelper.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_plan")
public class ReviewPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wrong_id", nullable = false)
    private Long wrongId;

    @Column(nullable = false)
    private int stage = 0;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_date", nullable = false)
    private LocalDate nextDate;

    @Column(name = "done_count", nullable = false)
    private int doneCount = 0;

    @Column(nullable = false)
    private boolean graduated = false;

    @Column(name = "last_date")
    private LocalDate lastDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Long getWrongId() { return wrongId; }
    public void setWrongId(Long wrongId) { this.wrongId = wrongId; }
    public int getStage() { return stage; }
    public void setStage(int stage) { this.stage = stage; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getNextDate() { return nextDate; }
    public void setNextDate(LocalDate nextDate) { this.nextDate = nextDate; }
    public LocalDate getLastDate() { return lastDate; }
    public void setLastDate(LocalDate lastDate) { this.lastDate = lastDate; }
    public int getDoneCount() { return doneCount; }
    public void setDoneCount(int doneCount) { this.doneCount = doneCount; }
    public boolean isGraduated() { return graduated; }
    public void setGraduated(boolean graduated) { this.graduated = graduated; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
