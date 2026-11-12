CREATE TABLE timetable_slot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week INT NOT NULL,
    period_index INT NOT NULL,
    subject VARCHAR(20) NOT NULL,
    lesson VARCHAR(500) NOT NULL DEFAULT '',
    mastery INT NOT NULL DEFAULT 0,
    note VARCHAR(500) NOT NULL DEFAULT '',
    CONSTRAINT uk_slot UNIQUE (day_of_week, period_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE slot_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_id BIGINT NOT NULL,
    item_type VARCHAR(4) NOT NULL,
    content VARCHAR(500) NOT NULL,
    note VARCHAR(300) NOT NULL DEFAULT '',
    done TINYINT(1) NOT NULL DEFAULT 0,
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_slot FOREIGN KEY (slot_id) REFERENCES timetable_slot (id) ON DELETE CASCADE,
    KEY idx_item_slot (slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE paper (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(20) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    exam_type VARCHAR(20) NOT NULL,
    exam_date DATE NOT NULL,
    score DOUBLE NOT NULL,
    full_score DOUBLE NOT NULL DEFAULT 100,
    reasons VARCHAR(200) NOT NULL DEFAULT '',
    has_photo TINYINT(1) NOT NULL DEFAULT 0,
    photo_path VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wrong_question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paper_id BIGINT NULL,
    subject VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL DEFAULT '三年级上',
    unit VARCHAR(50) NOT NULL,
    exam_type VARCHAR(20) NOT NULL,
    exam_date DATE NOT NULL,
    content VARCHAR(500) NOT NULL,
    reason VARCHAR(20) NOT NULL,
    mastered TINYINT(1) NOT NULL DEFAULT 0,
    KEY idx_wrong_filter (subject, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE star_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    delta INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
