package com.example.studyhelper.reward;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface StarLedgerRepository extends JpaRepository<StarLedger, Long> {

    @Query("select coalesce(sum(l.delta), 0) from StarLedger l")
    int balance();

    @Query("select coalesce(sum(l.delta), 0) from StarLedger l where l.createdAt >= :since")
    int sumSince(@Param("since") LocalDateTime since);
}
