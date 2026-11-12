CREATE TABLE subject_config (
    subject VARCHAR(50) PRIMARY KEY,
    no_homework TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 按真实课表预置：体育、音乐、阅读吧、班队活动、早读 默认无课后作业（可在应用内调整）
INSERT INTO subject_config (subject, no_homework) VALUES
('语文',0),('数学',0),('英语',0),('科学',0),
('体育与健康',1),('美术',0),('音乐',1),('道德与法治',0),
('劳动',0),('信息科技',0),('综合实践',0),('阅读吧',1),
('班队活动',1),('早读',1),('语文（书法）',0);
