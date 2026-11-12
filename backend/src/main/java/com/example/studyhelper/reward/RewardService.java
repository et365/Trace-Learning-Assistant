package com.example.studyhelper.reward;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

    private final StarLedgerRepository repo;

    public RewardService(StarLedgerRepository repo) { this.repo = repo; }

    public int balance() { return repo.balance(); }

    @Transactional
    public void add(String event, int delta) {
        var l = new StarLedger();
        l.setEvent(event);
        l.setDelta(delta);
        repo.save(l);
    }
}
