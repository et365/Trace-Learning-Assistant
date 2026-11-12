-- 每日必做：与课程无关的固定任务（如体育锻炼、语文阅读），支持配置
CREATE TABLE daily_routine (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 每日完成记录（一天一条）
CREATE TABLE routine_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    routine_id BIGINT NOT NULL,
    done_date DATE NOT NULL,
    done_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_routine_day (routine_id, done_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO daily_routine (name) VALUES
('体育锻炼 30 分钟'),
('语文阅读 20 分钟'),
('口算练习'),
('整理书包');
