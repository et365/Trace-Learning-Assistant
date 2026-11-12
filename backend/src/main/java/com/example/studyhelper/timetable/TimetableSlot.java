package com.example.studyhelper.timetable;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timetable_slot")
public class TimetableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @Column(name = "period_index", nullable = false)
    private int periodIndex;

    @Column(nullable = false, length = 20)
    private String subject;

    @Column(nullable = false)
    private String lesson = "";

    @Column(nullable = false)
    private int mastery = 0;

    @Column(nullable = false)
    private String note = "";

    @Column(name = "no_homework", nullable = false)
    private boolean noHomework = false;

    @Column(nullable = false)
    private boolean extra = false;

    @Column(name = "extra_date")
    private LocalDate extraDate;

    @OneToMany(mappedBy = "slot", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<SlotItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public int getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public int getPeriodIndex() { return periodIndex; }
    public void setPeriodIndex(int periodIndex) { this.periodIndex = periodIndex; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getLesson() { return lesson; }
    public void setLesson(String lesson) { this.lesson = lesson; }
    public int getMastery() { return mastery; }
    public void setMastery(int mastery) { this.mastery = mastery; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public boolean isNoHomework() { return noHomework; }
    public void setNoHomework(boolean noHomework) { this.noHomework = noHomework; }
    public boolean isExtra() { return extra; }
    public void setExtra(boolean extra) { this.extra = extra; }
    public LocalDate getExtraDate() { return extraDate; }
    public void setExtraDate(LocalDate extraDate) { this.extraDate = extraDate; }
    public List<SlotItem> getItems() { return items; }
}
