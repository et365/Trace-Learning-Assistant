-- 临时课程（调课/加课/代课）：仅某天生效，不进周课表
ALTER TABLE timetable_slot DROP INDEX uk_slot,
    ADD COLUMN extra TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN extra_date DATE NULL;
