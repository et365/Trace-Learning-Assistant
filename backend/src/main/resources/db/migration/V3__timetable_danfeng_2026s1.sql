-- 丹枫实验小学 2026学年第一学期 三年级(8)班 真实课表（解析自课表 PDF）
-- 同时清空演示期的作业条目与旧所学/自评，正式启用

DELETE FROM slot_item;

UPDATE timetable_slot SET subject='早读', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=0;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=1;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=2;
UPDATE timetable_slot SET subject='综合实践', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=3;
UPDATE timetable_slot SET subject='数学', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=4;
UPDATE timetable_slot SET subject='美术', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=5;
UPDATE timetable_slot SET subject='信息科技', lesson='', mastery=0, note='' WHERE day_of_week=1 AND period_index=6;
UPDATE timetable_slot SET subject='早读', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=0;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=1;
UPDATE timetable_slot SET subject='英语', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=2;
UPDATE timetable_slot SET subject='数学', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=3;
UPDATE timetable_slot SET subject='体育与健康', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=4;
UPDATE timetable_slot SET subject='语文（书法）', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=5;
UPDATE timetable_slot SET subject='音乐', lesson='', mastery=0, note='' WHERE day_of_week=2 AND period_index=6;
UPDATE timetable_slot SET subject='早读', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=0;
UPDATE timetable_slot SET subject='综合实践', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=1;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=2;
UPDATE timetable_slot SET subject='科学', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=3;
UPDATE timetable_slot SET subject='英语', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=4;
UPDATE timetable_slot SET subject='体育与健康', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=5;
UPDATE timetable_slot SET subject='音乐', lesson='', mastery=0, note='' WHERE day_of_week=3 AND period_index=6;
UPDATE timetable_slot SET subject='早读', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=0;
UPDATE timetable_slot SET subject='科学', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=1;
UPDATE timetable_slot SET subject='数学', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=2;
UPDATE timetable_slot SET subject='阅读吧', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=3;
UPDATE timetable_slot SET subject='美术', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=4;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=5;
UPDATE timetable_slot SET subject='道德与法治', lesson='', mastery=0, note='' WHERE day_of_week=4 AND period_index=6;
UPDATE timetable_slot SET subject='早读', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=0;
UPDATE timetable_slot SET subject='数学', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=1;
UPDATE timetable_slot SET subject='语文', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=2;
UPDATE timetable_slot SET subject='英语', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=3;
UPDATE timetable_slot SET subject='道德与法治', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=4;
UPDATE timetable_slot SET subject='劳动', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=5;
UPDATE timetable_slot SET subject='班队活动', lesson='', mastery=0, note='' WHERE day_of_week=5 AND period_index=6;
