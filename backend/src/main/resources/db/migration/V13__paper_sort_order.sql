-- 试卷自定义排序（拖拽排序）
ALTER TABLE paper ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

-- 按现有默认顺序（日期倒序）初始化序号
UPDATE paper p
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY exam_date DESC, id DESC) AS rn FROM paper) t ON p.id = t.id
SET p.sort_order = t.rn;
