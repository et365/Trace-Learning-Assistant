export const SUBJECTS: Record<string, string> = {
  语文: '#f97316', '语文（书法）': '#fb923c', 数学: '#3b82f6', 英语: '#10b981',
  科学: '#8b5cf6', 体育与健康: '#ef4444', 美术: '#f59e0b', 音乐: '#ec4899',
  道德与法治: '#14b8a6', 劳动: '#84cc16', 信息科技: '#06b6d4', 综合实践: '#a855f7',
  阅读吧: '#0ea5e9', 班队活动: '#64748b', 早读: '#0ea5e9'
};
export const SUBJECT_CYCLE = Object.keys(SUBJECTS);
export const HW_TYPE: Record<string, string> = { T: '课堂作业', F: '家庭加练', K: '任务' };
export const TYPE_BADGE: Record<string, string> = { T: '🏫 课堂', F: '🏠 加练', K: '📌 任务' };
export const PERIODS = [
  { index: 0, name: '早读', time: '08:25' },
  { index: 1, name: '第1节', time: '08:30' },
  { index: 2, name: '第2节', time: '09:25' },
  { index: 3, name: '第3节', time: '10:40' },
  { index: 4, name: '第4节', time: '13:20' },
  { index: 5, name: '第5节', time: '14:20' },
  { index: 6, name: '第6节', time: '15:15' }
];
export const DAYS = ['', '周一', '周二', '周三', '周四', '周五'];

export interface SlotItemDto { id: number; type: 'T' | 'F' | 'K'; typeLabel: string; content: string; note: string; done: boolean }
export interface SlotDto {
  id: number; dayOfWeek: number; dayName: string; periodIndex: number; periodName: string; time: string;
  subject: string; lesson: string; mastery: number; note: string; items: SlotItemDto[]; hasPlan: boolean;
  noHomework: boolean;
}
export interface TaskDto {
  slotId: number; subject: string; periodName: string; time: string; lesson: string; mastery: number; note: string;
  items: SlotItemDto[]; noHomework: boolean; extra: boolean; doneItems: number; totalItems: number; status: 0 | 1 | 2 | 3;
}
export interface TodayDto { dayLabel: string; weekend: boolean; tasks: TaskDto[]; doneCount: number; totalCount: number; stars: number }
export interface WrongDto {
  id: number; paperId: number | null; subject: string; semester: string; unit: string | null; type: string | null;
  date: string | null; content: string; reason: string; mastered: boolean;
  deleted: boolean; deletedAt: string | null; reviewStage: number | null;
}
export interface PaperDto {
  id: number; subject: string; unit: string; type: string; date: string; score: number; fullScore: number;
  reasons: string[]; hasPhoto: boolean; wrongs: WrongDto[];
}
export interface SubjectStat { subject: string; avg: number; n: number; target: number }
export interface AnalysisDto { subjects: SubjectStat[]; weak: SubjectStat | null; days: string[]; reasonTally: Record<string, number> }
export interface LessonEntryDto { periodName: string; subject: string; lesson: string }
export interface DayLessonsDto { day: string; entries: LessonEntryDto[] }
export interface MasteryStat { subject: string; pct: number }
export interface ReportDto {
  completionRate: number; itemsTotal: number; itemsDone: number; checkinDays: number; starsThisWeek: number;
  mastery: MasteryStat[];
  exam: { weakSubject: string | null; weakAvg: number | null; others: string; summary: string };
}
export interface SubjectConfigDto { subject: string; noHomework: boolean; color: string | null; target: number; hasExam: boolean }
export interface ReviewDto {
  id: number; wrongId: number; subject: string; content: string; unit: string | null; reason: string;
  round: number; passRequired: number; doneCount: number; nextDate: string; due: boolean;
  reviewedToday: boolean; outcome: string | null;
}
export interface RoutineDto { id: number; name: string; enabled: boolean; doneToday: boolean }
export interface ParsedItem { txt: string; note: string; optional: boolean }
export interface ParsedHomework { subject: string | null; items: ParsedItem[] }


// store/契约模块热替换会产生僵尸页面（DOM 在但界面永不更新），改为强制整页刷新
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}
