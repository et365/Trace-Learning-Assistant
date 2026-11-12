-- 是否为考试科目（默认仅主科）
ALTER TABLE subject_config ADD COLUMN has_exam TINYINT(1) NOT NULL DEFAULT 0;

UPDATE subject_config SET has_exam = 1 WHERE subject IN ('语文', '数学', '英语', '科学');
