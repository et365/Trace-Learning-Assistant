-- 间隔重复计划：错题/薄弱知识点按 1-2-4 天节奏复习，连续通过 3 次自动毕业
CREATE TABLE review_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wrong_id BIGINT NOT NULL,
    stage INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    next_date DATE NOT NULL,
    done_count INT NOT NULL DEFAULT 0,
    graduated TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_review_due (graduated, next_date),
    KEY idx_review_wrong (wrong_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
