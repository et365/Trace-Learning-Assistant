-- 每个科目的考试目标分（默认 90）
ALTER TABLE subject_config ADD COLUMN target DOUBLE NOT NULL DEFAULT 90;
