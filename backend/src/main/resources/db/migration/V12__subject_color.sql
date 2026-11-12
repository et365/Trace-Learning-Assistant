-- 科目颜色可配置
ALTER TABLE subject_config ADD COLUMN color VARCHAR(9) NULL;

-- 预置默认色（与前端默认色一致）
UPDATE subject_config SET color='#f97316' WHERE subject='语文';
UPDATE subject_config SET color='#fb923c' WHERE subject='语文（书法）';
UPDATE subject_config SET color='#3b82f6' WHERE subject='数学';
UPDATE subject_config SET color='#10b981' WHERE subject='英语';
UPDATE subject_config SET color='#8b5cf6' WHERE subject='科学';
UPDATE subject_config SET color='#ef4444' WHERE subject='体育与健康';
UPDATE subject_config SET color='#f59e0b' WHERE subject='美术';
UPDATE subject_config SET color='#ec4899' WHERE subject='音乐';
UPDATE subject_config SET color='#14b8a6' WHERE subject='道德与法治';
UPDATE subject_config SET color='#84cc16' WHERE subject='劳动';
UPDATE subject_config SET color='#06b6d4' WHERE subject='信息科技';
UPDATE subject_config SET color='#a855f7' WHERE subject='综合实践';
UPDATE subject_config SET color='#0ea5e9' WHERE subject='阅读吧';
UPDATE subject_config SET color='#64748b' WHERE subject='班队活动';
UPDATE subject_config SET color='#0ea5e9' WHERE subject='早读';
