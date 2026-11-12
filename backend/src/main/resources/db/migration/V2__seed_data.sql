-- 课表种子数据（周一~周五 × 早读+6 节）；lesson 记在每科当天第一次出现（第 1 节起）的格子上
INSERT INTO timetable_slot (day_of_week, period_index, subject, lesson, mastery, note) VALUES
(1,0,'英语','',0,''),
(1,1,'语文','《燕子》第1~3自然段，学习比喻句',0,''),
(1,2,'数学','两位数加减法口算',0,''),
(1,3,'英语','Unit 3 单词跟读',0,''),
(1,4,'美术','水彩画：我的家',0,''),
(1,5,'科学','植物的生长过程',0,''),
(1,6,'班会','交通安全主题',0,''),
(2,0,'语文','',0,''),
(2,1,'数学','两位数进位加法',0,''),
(2,2,'语文','《荷花》生字与造句',0,''),
(2,3,'体育','跳绳技巧',0,''),
(2,4,'道法','我是班级小主人',0,''),
(2,5,'音乐','歌曲《小螺号》',0,''),
(2,6,'自习','',0,''),
(3,0,'英语','',0,''),
(3,1,'语文','习作：写一种植物',0,''),
(3,2,'数学','进位加法练习课',0,''),
(3,3,'英语','Unit 3 句型操练',0,''),
(3,4,'科学','水的三态变化',0,''),
(3,5,'道法','规则在哪里',0,''),
(3,6,'体育','50 米跑',0,''),
(4,0,'语文','',0,''),
(4,1,'语文','第7课《鹿柴》：背诵与默写',5,''),
(4,2,'数学','两位数进位加法（例题课）',3,'口算错了 3 题，下次要细心'),
(4,3,'英语','Unit 4 单词 this / these',4,''),
(4,4,'体育','跳绳测试',4,''),
(4,5,'科学','水的浮力实验',2,'水的浮力实验还想再看一遍'),
(4,6,'美术','树叶贴画',3,''),
(5,0,'英语','',0,''),
(5,1,'数学','',0,''),
(5,2,'语文','',0,''),
(5,3,'美术','',0,''),
(5,4,'音乐','',0,''),
(5,5,'道法','',0,''),
(5,6,'自习','',0,'');

-- 周四（今天）的作业与任务种子
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','生字表抄写并组词','',1,NOW() FROM timetable_slot WHERE day_of_week=4 AND period_index=1;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','背诵第 7 课第 1 段','',1,NOW() FROM timetable_slot WHERE day_of_week=4 AND period_index=1;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','练习册 P32 第 1~4 题','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=2;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'F','口算 20 题','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=2;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'F','错题本订正 3 题','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=2;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','L5 单词抄写一遍','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=3;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'F','课文听读 10 分钟','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=3;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','跳绳 100 个','',1,NOW() FROM timetable_slot WHERE day_of_week=4 AND period_index=4;
INSERT INTO slot_item (slot_id, item_type, content, note, done, completed_at)
SELECT id,'T','完成实验记录单','',0,NULL FROM timetable_slot WHERE day_of_week=4 AND period_index=5;

-- 试卷与错题种子
INSERT INTO paper (subject, unit, exam_type, exam_date, score, full_score, reasons, has_photo) VALUES
('数学','第4单元','月考','2026-10-17',82,100,'粗心,没掌握',1),
('语文','第7单元','月考','2026-10-17',94,100,'粗心',1),
('英语','Unit 4','月考','2026-10-17',93,100,'粗心',0),
('数学','第3单元','单元测试','2026-10-10',84,100,'粗心,没复习',1),
('科学','第2单元','单元测试','2026-10-10',85,100,'没复习',0),
('语文','第3单元','单元测试','2026-09-26',88,100,'粗心',0),
('数学','第2单元','单元测试','2026-09-26',88,100,'没掌握',0),
('英语','Unit 2','单元测试','2026-09-19',90,100,'',0),
('数学','第1单元','单元测试','2026-09-12',95,100,'',0),
('语文','第1单元','单元测试','2026-09-12',92,100,'没掌握',0);

INSERT INTO wrong_question (paper_id, subject, semester, unit, exam_type, exam_date, content, reason, mastered) VALUES
(1,'数学','三年级上','第4单元','月考','2026-10-17','35 + 47 = 92，进位忘了加十位','粗心马虎',0),
(2,'语文','三年级上','第7单元','月考','2026-10-17','"暇"字目字旁写成了日字旁','没掌握',0),
(3,'英语','三年级上','Unit 4','月考','2026-10-17','听力题 bus / but 发音混淆选错','粗心马虎',0),
(4,'数学','三年级上','第3单元','单元测试','2026-10-10','长方形周长漏加两条短边','没掌握',1),
(5,'科学','三年级上','第2单元','单元测试','2026-10-10','水的三态变化温度条件记反','没复习',0),
(6,'语文','三年级上','第3单元','单元测试','2026-09-26','"已 / 己 / 巳"三兄弟辨析出错','粗心马虎',1),
(7,'数学','三年级上','第2单元','单元测试','2026-09-26','估算 202 × 4 时把 200 估成了 100','没掌握',1),
(10,'语文','三年级上','第1单元','单元测试','2026-09-12','多音字"处"标调错误','没掌握',1);

INSERT INTO star_ledger (event, delta) VALUES ('初始星星', 86);
