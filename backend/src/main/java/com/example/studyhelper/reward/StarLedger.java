package com.example.studyhelper.reward;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "star_ledger")
public class StarLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String event;

    @Column(nullable = false)
    private int delta;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }
    public int getDelta() { return delta; }
    public void setDelta(int delta) { this.delta = delta; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
