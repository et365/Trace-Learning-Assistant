import { create } from 'zustand';
import { del as apiDelete, get as apiGet, patch as apiPatch, post as apiPost, put as apiPut } from '../api/client';
import { SUBJECTS } from '../api/types';
import type { AnalysisDto, DayLessonsDto, PaperDto, ReportDto, ReviewDto, RoutineDto, SlotDto, SubjectConfigDto, TodayDto, WrongDto } from '../api/types';

function mergeColors(configs: SubjectConfigDto[]): Record<string, string> {
  const map: Record<string, string> = { ...SUBJECTS };
  for (const c of configs) if (c.color) map[c.subject] = c.color;
  return map;
}

export type View = 'today' | 'table' | 'exam' | 'wrong' | 'report';

let toastTimer: ReturnType<typeof setTimeout> | undefined;

interface AppState {
  view: View;
  toast: string | null;
  stars: number;
  today: TodayDto | null;
  slots: SlotDto[];
  subjects: string[];
  subjectConfigs: SubjectConfigDto[];
  colors: Record<string, string>;
  routines: RoutineDto[];
  papers: PaperDto[];
  analysis: AnalysisDto | null;
  chartSubject: string;
  wrongs: WrongDto[];
  trash: WrongDto[];
  reviews: ReviewDto[];
  wrongSubject: string;
  wrongSemester: string;
  report: ReportDto | null;
  lessons: DayLessonsDto[];
  slotEdit: SlotDto | null;
  setView: (v: View) => void;
  showToast: (msg: string) => void;
  load: (v: View) => Promise<void>;
  openSlot: (id: number) => void;
  closeSlot: () => void;
  setChartSubject: (s: string) => void;
  setSubjectNoHomework: (subject: string, v: boolean) => Promise<void>;
  setSubjectColor: (subject: string, color: string) => Promise<void>;
  setSubjectTarget: (subject: string, target: number) => Promise<void>;
  setSubjectHasExam: (subject: string, v: boolean) => Promise<void>;
  setWrongFilter: (subject: string, semester: string) => Promise<void>;
  updateSlot: (id: number, body: Partial<Pick<SlotDto, 'subject' | 'lesson' | 'mastery' | 'note' | 'noHomework'>>) => Promise<void>;
  addItem: (slotId: number, type: string, content: string, note?: string) => Promise<void>;
  setItemDone: (itemId: number, done: boolean) => Promise<void>;
  addExtraCourse: (subject: string, periodIndex: number) => Promise<void>;
  deleteExtraCourse: (slotId: number) => Promise<void>;
  addRoutine: (name: string) => Promise<void>;
  updateRoutine: (id: number, body: { name?: string; enabled?: boolean }) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  toggleRoutineDone: (id: number, done: boolean) => Promise<void>;
  startReview: (wrongId: number) => Promise<void>;
  passReview: (id: number) => Promise<void>;
  failReview: (id: number) => Promise<void>;
  updateItem: (itemId: number, body: { type?: string; content?: string; note?: string }) => Promise<void>;
  deleteItem: (slotId: number, itemId: number) => Promise<void>;
  addPaper: (body: unknown) => Promise<void>;
  updatePaper: (id: number, body: unknown) => Promise<void>;
  deletePaper: (id: number) => Promise<void>;
  reorderPapers: (ids: number[]) => Promise<void>;
  toggleMastered: (id: number, mastered: boolean) => Promise<void>;
  deleteWrong: (id: number) => Promise<void>;
  restoreWrong: (id: number) => Promise<void>;
  deleteWrongPermanent: (id: number) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

function applySlot(slots: SlotDto[], updated: SlotDto): SlotDto[] {
  return slots.map((s) => (s.id === updated.id ? updated : s));
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'today',
  toast: null,
  stars: 0,
  today: null,
  slots: [],
  subjects: [],
  subjectConfigs: [],
  colors: { ...SUBJECTS },
  routines: [],
  papers: [],
  analysis: null,
  chartSubject: '数学',
  wrongs: [],
  trash: [],
  reviews: [],
  wrongSubject: '全部',
  wrongSemester: '三年级上',
  report: null,
  lessons: [],
  slotEdit: null,

  setView: (v) => {
    set({ view: v });
    void get().load(v);
  },

  showToast: (msg) => {
    set({ toast: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 1800);
  },

  load: async (v) => {
    if (v === 'today') {
      const [t, routines, reviews, configs] = await Promise.all([
        apiGet<TodayDto>('/today'),
        apiGet<RoutineDto[]>('/routines'),
        apiGet<ReviewDto[]>('/reviews/today'),
        apiGet<SubjectConfigDto[]>('/subject-configs')
      ]);
      set({ today: t, stars: t.stars, routines, reviews, subjectConfigs: configs, colors: mergeColors(configs) });
    } else if (v === 'table') {
      const [r, configs] = await Promise.all([
        apiGet<{ slots: SlotDto[]; subjects: string[] }>('/timetable'),
        apiGet<SubjectConfigDto[]>('/subject-configs')
      ]);
      set({ slots: r.slots, subjects: r.subjects, subjectConfigs: configs, colors: mergeColors(configs) });
    } else if (v === 'exam') {
      const [papers, analysis] = await Promise.all([
        apiGet<PaperDto[]>('/papers'),
        apiGet<AnalysisDto>('/exams/analysis')
      ]);
      set({ papers, analysis });
    } else if (v === 'wrong') {
      const { wrongSubject, wrongSemester } = get();
      const q = new URLSearchParams({ subject: wrongSubject, semester: wrongSemester });
      const [wrongs, trash] = await Promise.all([
        apiGet<WrongDto[]>('/wrongs?' + q.toString()),
        apiGet<WrongDto[]>('/wrongs/trash')
      ]);
      set({ wrongs, trash });
    } else if (v === 'report') {
      const [report, lessons] = await Promise.all([
        apiGet<ReportDto>('/report/week'),
        apiGet<DayLessonsDto[]>('/lessons/week')
      ]);
      set({ report, lessons });
    }
  },

  openSlot: (id) => {
    const slot = get().slots.find((s) => s.id === id);
    if (slot) set({ slotEdit: slot });
  },

  closeSlot: () => {
    set({ slotEdit: null });
    void get().load('today');
  },

  setChartSubject: (s) => set({ chartSubject: s }),

  setSubjectNoHomework: async (subject, noHomework) => {
    await apiPost('/subject-configs', { subject, noHomework });
    const configs = await apiGet<SubjectConfigDto[]>('/subject-configs');
    set({ subjectConfigs: configs, colors: mergeColors(configs) });
    if (get().today) await get().load('today');
  },

  setSubjectColor: async (subject, color) => {
    await apiPost('/subject-configs', { subject, color });
    const configs = await apiGet<SubjectConfigDto[]>('/subject-configs');
    set({ subjectConfigs: configs, colors: mergeColors(configs) });
    if (get().today) await get().load('today');
  },

  setSubjectTarget: async (subject, target) => {
    await apiPost('/subject-configs', { subject, target });
    const configs = await apiGet<SubjectConfigDto[]>('/subject-configs');
    set({ subjectConfigs: configs, colors: mergeColors(configs) });
    if (get().today) await get().load('today');
  },

  setSubjectHasExam: async (subject, hasExam) => {
    await apiPost('/subject-configs', { subject, hasExam });
    const configs = await apiGet<SubjectConfigDto[]>('/subject-configs');
    set({ subjectConfigs: configs, colors: mergeColors(configs) });
    if (get().today) await get().load('today');
  },

  setWrongFilter: async (subject, semester) => {
    set({ wrongSubject: subject, wrongSemester: semester });
    await get().load('wrong');
  },

  updateSlot: async (id, body) => {
    const updated = await apiPut<SlotDto>('/slots/' + id, body);
    set({ slots: applySlot(get().slots, updated), slotEdit: get().slotEdit?.id === id ? updated : get().slotEdit });
    if (body.lesson !== undefined || body.note !== undefined || body.mastery !== undefined || body.noHomework !== undefined) {
      void get().load('today');
    }
  },

  addItem: async (slotId, type, content, note) => {
    const updated = await apiPost<SlotDto>('/slots/' + slotId + '/items', { type, content, note: note || '' });
    set({ slots: applySlot(get().slots, updated), slotEdit: get().slotEdit?.id === slotId ? updated : get().slotEdit });
    void get().load('today');
  },

  setItemDone: async (itemId, done) => {
    const r = await apiPatch<{ stars: number }>('/slot-items/' + itemId, { done });
    set({ stars: r.stars });
    void get().load('today');
  },

  addExtraCourse: async (subject, periodIndex) => {
    const t = await apiPost<TodayDto>('/today/extra-course', { subject, periodIndex });
    set({ today: t, stars: t.stars });
  },

  deleteExtraCourse: async (slotId) => {
    await apiDelete('/slots/' + slotId);
    await get().load('today');
  },

  addRoutine: async (name) => {
    await apiPost('/routines', { name });
    set({ routines: await apiGet<RoutineDto[]>('/routines') });
  },

  updateRoutine: async (id, body) => {
    await apiPut('/routines/' + id, body);
    set({ routines: await apiGet<RoutineDto[]>('/routines') });
  },

  deleteRoutine: async (id) => {
    await apiDelete('/routines/' + id);
    set({ routines: await apiGet<RoutineDto[]>('/routines') });
  },

  toggleRoutineDone: async (id, done) => {
    await apiPatch('/routines/' + id + '/done', { done });
    set({ routines: await apiGet<RoutineDto[]>('/routines') });
  },

  updateItem: async (itemId, body) => {
    const updated = await apiPut<SlotDto>('/slot-items/' + itemId, body);
    set({ slots: applySlot(get().slots, updated), slotEdit: get().slotEdit?.id === updated.id ? updated : get().slotEdit });
    void get().load('today');
  },

  deleteItem: async (slotId, itemId) => {
    const r = await apiDelete<{ stars: number }>('/slot-items/' + itemId);
    set({ stars: r.stars });
    if (get().slotEdit?.id === slotId) {
      const updated = await apiGet<SlotDto>('/slots/' + slotId);
      set({ slots: applySlot(get().slots, updated), slotEdit: updated });
    }
    void get().load('today');
  },

  addPaper: async (body) => {
    await apiPost('/papers', body);
    await get().load('exam');
  },

  updatePaper: async (id, body) => {
    await apiPut('/papers/' + id, body);
    await get().load('exam');
  },

  deletePaper: async (id) => {
    await apiDelete('/papers/' + id);
    await get().load('exam');
  },

  reorderPapers: async (ids) => {
    await apiPut('/papers/order', { ids });
    await get().load('exam');
  },

  toggleMastered: async (id, mastered) => {
    await apiPatch('/wrongs/' + id + '/mastered', { mastered });
    await get().load('wrong');
  },

  deleteWrong: async (id) => {
    await apiDelete('/wrongs/' + id);
    await get().load('wrong');
  },

  restoreWrong: async (id) => {
    await apiPost('/wrongs/' + id + '/restore', {});
    await get().load('wrong');
  },

  deleteWrongPermanent: async (id) => {
    await apiDelete('/wrongs/' + id + '/permanent');
    await get().load('wrong');
  },

  emptyTrash: async () => {
    await apiDelete('/wrongs/trash');
    await get().load('wrong');
  },

  startReview: async (wrongId) => {
    await apiPost('/reviews', { wrongId });
    const [reviews, wrongs] = await Promise.all([
      apiGet<ReviewDto[]>('/reviews/today'),
      apiGet<WrongDto[]>('/wrongs?subject=' + encodeURIComponent(get().wrongSubject)
        + '&semester=' + encodeURIComponent(get().wrongSemester))
    ]);
    set({ reviews, wrongs });
  },

  passReview: async (id) => {
    await apiPost('/reviews/' + id + '/pass', {});
    await get().load('today');
  },

  failReview: async (id) => {
    await apiPost('/reviews/' + id + '/fail', {});
    await get().load('today');
    get().showToast('进度已重置，明天从第 1 次继续 💪');
  }
}));


// store/契约模块热替换会产生僵尸页面（DOM 在但界面永不更新），改为强制整页刷新
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}


