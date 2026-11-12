package com.example.studyhelper.timetable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "subject_config")
public class SubjectConfig {

    @Id
    @Column(length = 50)
    private String subject;

    @Column(name = "no_homework", nullable = false)
    private boolean noHomework = false;

    @Column(length = 9)
    private String color;

    @Column(nullable = false)
    private double target = 90;

    @Column(name = "has_exam", nullable = false)
    private boolean hasExam = false;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public boolean isNoHomework() { return noHomework; }
    public void setNoHomework(boolean noHomework) { this.noHomework = noHomework; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public double getTarget() { return target; }
    public void setTarget(double target) { this.target = target; }
    public boolean isHasExam() { return hasExam; }
    public void setHasExam(boolean hasExam) { this.hasExam = hasExam; }
}
