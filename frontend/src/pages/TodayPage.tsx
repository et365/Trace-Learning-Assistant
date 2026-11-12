import { useRef, useState } from 'react';
import { get as apiGet } from '../api/client';
import { useAppStore } from '../stores/appStore';
import { PERIODS, SUBJECT_CYCLE, TYPE_BADGE } from '../api/types';
import type { TodayDto } from '../api/types';
import PasteImport from '../components/PasteImport';
import ItemEditForm from '../components/ItemEditForm';

const HW_LABEL = ['未开始', '进行中', '已完成', '无作业'];
const CAL_HEADS = ['一', '二', '三', '四', '五', '六', '日'];

function pad(n: number) { return String(n).padStart(2, '0'); }
function todayISO() { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; }
function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

interface CalDay { date: string; hasRecord: boolean }

export default function TodayPage() {
  const {
    today, updateSlot, setItemDone, addItem, updateItem, deleteItem,
    addExtraCourse, deleteExtraCourse, showToast,
    routines, addRoutine, updateRoutine, deleteRoutine, toggleRoutineDone,
    reviews, startReview, passReview, failReview,
    colors
  } = useAppStore();

  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true });
  const [panel, setPanel] = useState<{ i: number; mode: 'add' | 'paste' } | null>(null);
  const [addType, setAddType] = useState<'T' | 'F'>('T');
  const [addTxt, setAddTxt] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraSubject, setExtraSubject] = useState('语文');
  const [extraPeriod, setExtraPeriod] = useState(6);
  const [routineCfg, setRoutineCfg] = useState(false);
  const [newRoutine, setNewRoutine] = useState('');
  const extraPanelRef = useRef<HTMLDivElement | null>(null);
  const histPanelRef = useRef<HTMLDivElement | null>(null);

  const [histOpen, setHistOpen] = useState(false);
  const [histMonth, setHistMonth] = useState<string>(() => todayISO().slice(0, 7));
  const [histDays, setHistDays] = useState<CalDay[]>([]);
  const [histDate, setHistDate] = useState<string | null>(null);
  const [histData, setHistData] = useState<TodayDto | null>(null);

  const loadHistMonth = async (m: string) => {
    try {
      const r = await apiGet<{ month: string; days: CalDay[] }>('/calendar?month=' + m);
      setHistDays(r.days);
      setHistMonth(r.month);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '加载历史失败');
    }
  };

  const changeMonth = (delta: number) => void loadHistMonth(shiftMonth(histMonth, delta));

  const pickDate = async (d: string) => {
    try {
      const r = await apiGet<TodayDto>('/day/' + d);
      setHistDate(d);
      setHistData(r);
      setHistOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '加载失败');
    }
  };

  if (!today) return <div className="sh-view"><div className="sh-card">加载中…</div></div>;

  const enabledRoutines = routines.filter((r) => r.enabled);
  const routineDone = enabledRoutines.filter((r) => r.doneToday).length;
  const dueReviews = reviews.filter((r) => !r.reviewedToday);
  const doneReviews = reviews.filter((r) => r.reviewedToday);

  const viewing = histDate && histData ? histData : null;
  const v = viewing ?? today;
  const total = v.totalCount;
  const pct = total ? Math.round((v.doneCount / total) * 100) : 0;

  const submitAdd = (slotId: number) => {
    if (!addTxt.trim()) return;
    void addItem(slotId, addType, addTxt.trim());
    setAddTxt('');
  };

  const isoToday = todayISO();
  const [cy, cm] = histMonth.split('-').map(Number);
  const firstDow = (new Date(cy, cm - 1, 1).getDay() + 6) % 7; // 周一=0
  const daysInMonth = new Date(cy, cm, 0).getDate();
  const calCells: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${histMonth}-${pad(i + 1)}`)
  ];
  const hasRec = (d: string) => histDays.find((x) => x.date === d)?.hasRecord ?? false;

  return (
    <section className="sh-view">
      <div className="sh-card">
        <div className="sh-greet">
          <b>{viewing ? `📖 ${v.dayLabel} · 完成情况（只读回看）` : `今日任务${today.weekend ? '（周末展示周五）' : ''}`}</b>
          <span>{total > 0 && v.doneCount === total ? '全部完成，太棒啦 🎉' : '今天也要加油呀！'}</span>
        </div>
        <div className="sh-progress-row">
          <span><b className="tabular-nums">{v.doneCount}/{total}</b> 已完成</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="sh-track"><div className="sh-fill" style={{ width: pct + '%' }} /></div>
        <div className="sh-mini">
          {viewing ? '历史回看不支持修改；如需调整请联系数据说明' : '每科作业全部完成得 ⭐ · 数据保存在本机 MySQL'}
        </div>
        <div className="sh-btnrow" style={{ marginTop: 10 }}>
          {!viewing && (
            <button className={'sh-btn' + (extraOpen ? ' primary' : '')} type="button"
              onClick={() => {
                const next = !extraOpen;
                setExtraOpen(next);
                if (next) {
                  showToast('已打开「添加科目」面板 ⬇');
                  window.setTimeout(() => extraPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
                }
              }}>＋ 添加科目（调课/加课）</button>
          )}
          <button className={'sh-btn' + (histOpen ? ' primary' : '')} type="button"
            onClick={() => {
              const next = !histOpen;
              if (next) void loadHistMonth(histMonth);
              setHistDate(null);
              setHistOpen(next);
              if (next) {
                showToast('已打开历史回看日历 📅');
                window.setTimeout(() => histPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
              }
            }}>📅 历史回看</button>
          {viewing && (
            <button className="sh-btn primary" type="button"
              onClick={() => { setHistDate(null); setHistData(null); }}>↩ 返回今天</button>
          )}
        </div>
      </div>

      {!viewing && (
      <div className="sh-card">
        <div className="sh-wrong-bar">
          <h4 style={{ margin: 0 }}>📌 每日必做</h4>
          <button className="sh-miniact" type="button" aria-label="配置每日必做"
            onClick={() => setRoutineCfg(!routineCfg)}>⚙️ 配置</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {enabledRoutines.length === 0 && (
            <div className="sh-note">还没有必做项，点「⚙️ 配置」添加（如：体育锻炼、语文阅读）</div>
          )}
          {enabledRoutines.map((r) => (
            <div key={r.id} className={'sh-hwitem' + (r.doneToday ? ' done' : '')}>
              <button className="sh-check" type="button" aria-pressed={r.doneToday}
                aria-label={'完成：' + r.name}
                onClick={() => void toggleRoutineDone(r.id, !r.doneToday)}>
                {r.doneToday ? '✓' : ''}
              </button>
              <span className="sh-hwmain"><span className="sh-hwtxt">{r.name}</span></span>
            </div>
          ))}
        </div>
        {enabledRoutines.length > 0 && (
          <div className="sh-mini">已完成 {routineDone}/{enabledRoutines.length} · 与当天课程无关，每天都要做</div>
        )}
        {routineCfg && (
          <div className="sh-addrow" style={{ marginTop: 8 }}>
            <div className="sh-impnote">配置修改立即生效；关闭「启用」= 今天不显示（数据保留）</div>
            {routines.map((r) => (
              <div key={r.id} className="sh-subjrow">
                <input className="sh-impedit" key={'rn' + r.id + r.name} defaultValue={r.name}
                  aria-label={r.name + ' 名称'}
                  onBlur={(e) => { const v2 = e.target.value.trim(); if (v2 && v2 !== r.name) void updateRoutine(r.id, { name: v2 }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
                <span className="sh-switchlbl">启用</span>
                <input type="checkbox" className="sh-switch" checked={r.enabled} aria-label={r.name + ' 启用'}
                  onChange={(e) => void updateRoutine(r.id, { enabled: e.target.checked })} />
                <button className="sh-miniact" type="button" aria-label={'删除：' + r.name}
                  onClick={() => void deleteRoutine(r.id)}>🗑</button>
              </div>
            ))}
            <div className="sh-addinput">
              <input className="sh-input" value={newRoutine} placeholder="新必做项，如：英语听读 15 分钟"
                onChange={(e) => setNewRoutine(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newRoutine.trim()) { void addRoutine(newRoutine.trim()); setNewRoutine(''); } }} />
              <button className="sh-btn primary" type="button"
                onClick={() => { if (newRoutine.trim()) { void addRoutine(newRoutine.trim()); setNewRoutine(''); } }}>添加</button>
            </div>
          </div>
        )}
      </div>
      )}

      {reviews.length > 0 && !viewing && (
        <div className="sh-card">
          <div className="sh-wrong-bar">
            <h4 style={{ margin: 0 }}>🔁 今日复习（间隔重复）</h4>
            <span className="sh-tag">{dueReviews.length} 项到期 · 已复习 {doneReviews.length}</span>
          </div>
          {dueReviews.length === 0 && doneReviews.length > 0 && (
            <div className="sh-note" style={{ marginTop: 8 }}>今天到期的都复习完啦，明天按计划继续 💪</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {dueReviews.map((r) => (
              <div key={r.id} className="sh-hwitem" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, cursor: 'default' }}>
                <div className="sh-impeditrow">
                  <span className="sh-subj" style={{ background: colors[r.subject] || '#64748b', fontSize: 11.5, padding: '1px 8px' }}>{r.subject}</span>
                  <span className="sh-hwtxt" style={{ flex: 1 }}>{r.content}</span>
                </div>
                {r.unit && <div className="sh-impnote">单元：{r.unit}</div>}
                <div className="sh-impeditrow">
                  <span className="sh-tag">第 {r.round} 次复习</span>
                  <div className="sh-track" style={{ flex: 1 }}>
                    <div className="sh-fill" style={{ width: (r.doneCount / r.passRequired) * 100 + '%', background: 'var(--sh-primary)' }} />
                  </div>
                  <span className="sh-mpct tabular-nums">{r.doneCount}/{r.passRequired}</span>
                </div>
                <div className="sh-btnrow">
                  <button className="sh-btn primary" type="button" style={{ flex: 1 }}
                    onClick={() => void passReview(r.id)}>✓ 我掌握了</button>
                  <button className="sh-btn" type="button" style={{ flex: 1 }}
                    onClick={() => void failReview(r.id)}>✗ 还没掌握</button>
                </div>
              </div>
            ))}
            {doneReviews.map((r) => (
              <div key={r.id} className="sh-hwitem" style={{ cursor: 'default', opacity: 0.75 }}>
                <span className="sh-subj" style={{ background: colors[r.subject] || '#64748b', fontSize: 11.5, padding: '1px 8px' }}>{r.subject}</span>
                <span className="sh-hwtxt" style={{ flex: 1 }}>{r.content}</span>
                <span className="sh-tag">
                  {r.outcome === 'graduated' ? '🎓 连续 3 次通过，已毕业'
                    : r.outcome === 'fail' ? '✗ 明天从第 1 次重来'
                    : '✓ 明天第 ' + r.round + ' 次'}
                </span>
              </div>
            ))}
          </div>
          <div className="sh-mini" style={{ marginTop: 8 }}>连续通过 3 次自动毕业并关闭该知识点；点「还没掌握」明天从第 1 次重来</div>
        </div>
      )}
      {extraOpen && (
        <div className="sh-card" ref={extraPanelRef}>
          <div className="sh-paste-head">
            <b>➕ 添加临时科目</b>
            <button className="sh-x" type="button" onClick={() => setExtraOpen(false)} aria-label="关闭">✕</button>
          </div>
          <div className="sh-impnote" style={{ margin: '6px 0' }}>调课、加课时使用：仅对今天生效，不会改动周课程表</div>
          <div className="sh-chiprow" style={{ marginBottom: 8 }}>
            {SUBJECT_CYCLE.map((s) => (
              <button key={s} className={'sh-cchip' + (extraSubject === s ? ' on' : '')} type="button"
                onClick={() => setExtraSubject(s)}>{s}</button>
            ))}
          </div>
          <div className="sh-addinput">
            <select className="sh-select" style={{ width: 'auto' }} value={extraPeriod} aria-label="节次"
              onChange={(e) => setExtraPeriod(+e.target.value)}>
              {PERIODS.map((p) => <option key={p.index} value={p.index}>{p.name} {p.time}</option>)}
            </select>
            <button className="sh-btn primary" type="button" onClick={() => {
              void addExtraCourse(extraSubject, extraPeriod);
              setExtraOpen(false);
              showToast('已添加临时课程：' + extraSubject + ' ✓');
            }}>添加</button>
          </div>
        </div>
      )}

      {histOpen && !viewing && (
        <div className="sh-card" ref={histPanelRef}>
          <div className="sh-paste-head">
            <b>📅 历史回看 · {histMonth}</b>
            <button className="sh-x" type="button" onClick={() => setHistOpen(false)} aria-label="关闭">✕</button>
          </div>
          <div className="sh-calnav">
            <button className="sh-btn" type="button" onClick={() => changeMonth(-1)}>‹ 上个月</button>
            <button className="sh-btn" type="button" onClick={() => changeMonth(1)}>下个月 ›</button>
          </div>
          <div className="sh-cal">
            {CAL_HEADS.map((h) => <div key={h} className="sh-cal-hd">{h}</div>)}
            {calCells.map((d, idx) => d === null
              ? <div key={'x' + idx} />
              : (
                <button key={d} type="button"
                  className={'sh-cal-day'
                    + (hasRec(d) ? ' on' : '')
                    + (d === todayISO() ? ' today' : '')
                    + (histDate === d ? ' sel' : '')}
                  disabled={!hasRec(d)}
                  title={hasRec(d) ? '查看当天完成情况' : '当天没有学习记录'}
                  onClick={() => void pickDate(d)}>
                  {+d.slice(8)}
                  {hasRec(d) && <span className="sh-caldot" />}
                </button>
              ))}
          </div>
          <div className="sh-impnote"><span className="sh-caldot-inline" /> 红点 = 当天有学习记录，点击查看当天完成情况</div>
        </div>
      )}

      {!viewing && today.tasks.map((t, i) => {
        const col = colors[t.subject] || '#64748b';
        const isOpen = !!open[i];
        const stars = [];
        for (let n = 1; n <= 5; n++) {
          stars.push(
            <button key={n} className={'sh-star' + (n <= t.mastery ? ' on' : '')} type="button"
              onClick={() => void updateSlot(t.slotId, { mastery: n })} aria-label={t.subject + n + '星'}>★</button>
          );
        }
        return (
          <div key={t.slotId} className="sh-task" style={{ borderLeftColor: col }}>
            <button className="sh-task-head" type="button" aria-expanded={isOpen}
              onClick={() => setOpen({ ...open, [i]: !isOpen })}>
              <span className="sh-subj" style={{ background: col }}>{t.subject}</span>
              {t.extra && <span className="sh-tag">临时</span>}
              <span className="sh-meta">{t.periodName} {t.time}</span>
              <span className="sh-hwinfo">{t.noHomework ? '无作业' : t.totalItems > 0 ? t.totalItems + ' 项作业' : '＋ 添加作业'}</span>
              <span className="sh-chev">{isOpen ? '▲' : '▼'}</span>
            </button>
            <div className="sh-statusline">
              <span className="sh-hw" data-hw={t.status}>{HW_LABEL[t.status]}</span>
              <span className="sh-stars" role="group" aria-label={t.subject + '掌握度'}>
                <span className="sh-starlbl">掌握度</span>{stars}
                <span className="sh-mval">{t.mastery ? t.mastery + ' 星' : '未评'}</span>
              </span>
            </div>
            {!isOpen && t.noHomework && <div className="sh-note">🚫 今日无作业</div>}
            {isOpen && (
              <div className="sh-hwlist">
                <div className="sh-lessonrow">
                  <span className="sh-lessonlbl">📖 所学</span>
                  <input key={'tl' + t.slotId + t.lesson} className="sh-input" defaultValue={t.lesson}
                    placeholder="记一记今天学了什么，周末复习用"
                    onBlur={(e) => { if (e.target.value.trim() !== t.lesson) void updateSlot(t.slotId, { lesson: e.target.value.trim() }); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
                </div>
                {t.items.map((it) => (
                  <div key={it.id} className={'sh-hwitem' + (it.done ? ' done' : '')}>
                    {editId === it.id ? (
                      <ItemEditForm
                        initial={{ type: it.type, content: it.content, note: it.note }}
                        onSave={(v) => { void updateItem(it.id, v); setEditId(null); }}
                        onCancel={() => setEditId(null)} />
                    ) : (
                      <>
                        <span className={'sh-tbadge ' + it.type.toLowerCase()}>{TYPE_BADGE[it.type]}</span>
                        <button className="sh-hwmainbtn" type="button" aria-pressed={it.done}
                          onClick={() => void setItemDone(it.id, !it.done)}>
                          <span className="sh-hwmain">
                            <span className="sh-hwtxt">{it.content}</span>
                            {it.note && <span className="sh-hwnote">💬 {it.note}</span>}
                          </span>
                        </button>
                        <button className="sh-miniact" type="button" aria-label={'编辑：' + it.content}
                          onClick={() => setEditId(it.id)}>✎</button>
                        <button className="sh-miniact" type="button" aria-label={'删除：' + it.content}
                          onClick={() => void deleteItem(t.slotId, it.id)}>🗑</button>
                        <button className="sh-check" type="button" aria-pressed={it.done}
                          aria-label={'完成：' + it.content}
                          onClick={() => void setItemDone(it.id, !it.done)}>✓</button>
                      </>
                    )}
                  </div>
                ))}
                {t.items.length === 0 && <div className="sh-note">这一科还没有作业，在下面添加吧</div>}
                {panel && panel.i === i && panel.mode === 'add' && (
                  <div className="sh-addrow">
                    <div className="sh-addtypes">
                      <button className={'sh-cchip' + (addType === 'T' ? ' on' : '')} type="button"
                        onClick={() => setAddType('T')}>🏫 课堂作业</button>
                      <button className={'sh-cchip' + (addType === 'F' ? ' on' : '')} type="button"
                        onClick={() => setAddType('F')}>🏠 家庭加练</button>
                    </div>
                    <div className="sh-addinput">
                      <input className="sh-input" value={addTxt} placeholder="如：口算 20 题 / 听读 10 分钟"
                        onChange={(e) => setAddTxt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(t.slotId); }} />
                      <button className="sh-btn primary" type="button" onClick={() => submitAdd(t.slotId)}>添加</button>
                    </div>
                  </div>
                )}
                {panel && panel.i === i && panel.mode === 'paste' && (
                  <PasteImport slotId={t.slotId} onDone={() => setPanel(null)} />
                )}
                {t.extra && (
                  <button className="sh-btn" type="button"
                    onClick={() => void deleteExtraCourse(t.slotId)}>🗑 移除该临时课程</button>
                )}
                <div className="sh-btnrow">
                  <button className="sh-btn" type="button"
                    onClick={() => setPanel(panel && panel.i === i && panel.mode === 'add' ? null : { i, mode: 'add' })}>＋ 添加作业</button>
                  <button className="sh-btn" type="button"
                    onClick={() => setPanel(panel && panel.i === i && panel.mode === 'paste' ? null : { i, mode: 'paste' })}>📋 粘贴老师消息</button>
                  <button className={'sh-btn' + (t.noHomework ? ' primary' : '')} type="button"
                    aria-pressed={t.noHomework}
                    onClick={() => void updateSlot(t.slotId, { noHomework: !t.noHomework })}>
                    {t.noHomework ? '✅ 已标记无作业' : '🚫 今日无作业'}
                  </button>
                </div>
              </div>
            )}
            {!isOpen && t.lesson && <div className="sh-note">📖 {t.lesson}</div>}
            {!isOpen && t.note && <div className="sh-note">💬 {t.note}</div>}
          </div>
        );
      })}

      {viewing && viewing.tasks.map((t) => {
        const col = colors[t.subject] || '#64748b';
        return (
          <div key={t.slotId} className="sh-task" style={{ borderLeftColor: col }}>
            <div className="sh-task-head" style={{ cursor: 'default' }}>
              <span className="sh-subj" style={{ background: col }}>{t.subject}</span>
              {t.extra && <span className="sh-tag">临时</span>}
              <span className="sh-meta">{t.periodName} {t.time}</span>
              <span className="sh-hwinfo">{t.noHomework ? '无作业' : `${t.doneItems}/${t.totalItems} 项`}</span>
            </div>
            <div className="sh-statusline">
              <span className="sh-hw" data-hw={t.status}>{HW_LABEL[t.status]}</span>
              <span className="sh-stars">
                <span className="sh-starlbl">掌握度</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={'sh-star' + (n <= t.mastery ? ' on' : '')}>★</span>
                ))}
                <span className="sh-mval">{t.mastery ? t.mastery + ' 星' : '未评'}</span>
              </span>
            </div>
            {t.items.map((it) => (
              <div key={it.id} className={'sh-hwitem' + (it.done ? ' done' : '')} style={{ cursor: 'default' }}>
                <span className={'sh-tbadge ' + it.type.toLowerCase()}>{TYPE_BADGE[it.type]}</span>
                <span className="sh-hwmain">
                  <span className="sh-hwtxt">{it.content}</span>
                  {it.note && <span className="sh-hwnote">💬 {it.note}</span>}
                </span>
                <span className="sh-check">{it.done ? '✓' : ''}</span>
              </div>
            ))}
            {t.items.length === 0 && !t.noHomework && <div className="sh-note">当天没有作业记录</div>}
          </div>
        );
      })}
    </section>
  );
}
