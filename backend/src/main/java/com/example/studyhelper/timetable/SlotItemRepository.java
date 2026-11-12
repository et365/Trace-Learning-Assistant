package com.example.studyhelper.timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface SlotItemRepository extends JpaRepository<SlotItem, Long> {

    @Query("select count(si) from SlotItem si join si.slot s where s.dayOfWeek between 1 and 5")
    long countWeekItems();

    @Query("select count(si) from SlotItem si join si.slot s where s.dayOfWeek between 1 and 5 and si.done = true")
    long countWeekDoneItems();

    @Query(value = "select count(distinct date(si.completed_at)) from slot_item si " +
            "join timetable_slot ts on ts.id = si.slot_id " +
            "where ts.day_of_week between 1 and 5 and si.completed_at >= :since", nativeQuery = true)
    long countCheckinDaysSince(@Param("since") LocalDateTime since);
}
