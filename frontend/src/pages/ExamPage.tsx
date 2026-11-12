import { useRef, useState } from 'react';
import { useAppStore } from '../stores/appStore';

import TrendChart from '../components/TrendChart';

const EXAM_SUBS = ['语文', '数学', '英语', '科学'];
const REASON_CATS = ['粗心', '没掌握', '没复习', '时间不够'];
const REASON_COLORS: Record<string, string> = { 粗心: '#f59e0b', 没掌握: '#ef4444', 没复习: '#8b5cf6', 时间不够: '#0ea5e9' };

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function ExamPage() {
  const { papers, analysis, chartSubject, setChartSubject, addPaper, updatePaper, deletePaper, reorderPapers, showToast, colors, subjectConfigs, setSubjectHasExam, setSubjectTarget } = useAppStore();
  const dragIdRef = useRef<number | null>(null);
  const [examCfgOpen, setExamCfgOpen] = useState(false);

  // 考试科目 = 科目设置里开启「考试」的科目（兜底：默认四主科）
  const examSubjects = subjectConfigs.length
    ? subjectConfigs.filter((c) => c.hasExam).map((c) => c.subject)
    : EXAM_SUBS;
  const [expanded, setExpanded] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [paperFilter, setPaperFilter] = useState('全部');
  const [examDate, setExamDate] = useState(todayStr());
  const [subj, setSubj] = useState('数学');
  const [type, setType] = useState('单元测试');
  const [unit, setUnit] = useState('');
  const [score, setScore] = useState('');
  const [full, setFull] = useState('100');
  const [reasons, setReasons] = useState<Set<string>>(new Set());
  const [err, setErr] = useState('');

  const save = async () => {
    const s = parseFloat(score);
    const f = parseFloat(full) || 100;
    if (isNaN(s) || s < 0 || s > f) { setErr('请输入 0 到 ' + f + ' 之间的分数'); return; }
    const body = {
      subject: subj, unit: unit.trim() || '未分单元', type,
      date: examDate || todayStr(), score: s, fullScore: f,
      reasons: [...reasons], wrongs: []
    };
    if (editId != null) {
      await updatePaper(editId, body);
      showToast('试卷已更新 ✓');
    } else {
      await addPaper(body);
      showToast('已记录 1 次「' + subj + '」成绩 ✓');
    }
    setErr(''); setScore(''); setUnit(''); setReasons(new Set()); setFormOpen(false);
    setEditId(null);
    setExamDate(todayStr());
    setChartSubject(subj);
  };

  const openEdit = (pid: number) => {
    const p = papers.find((x) => x.id === pid);
    if (!p) return;
    setEditId(pid);
    setSubj(p.subject);
    setType(p.type);
    setUnit(p.unit);
    setScore(String(p.score));
    setFull(String(p.fullScore));
    setReasons(new Set(p.reasons));
    setExamDate(p.date);
    setFormOpen(true);
    setExpanded(null);
    window.setTimeout(() => {
      document.getElementById('f-score')?.scrollIntoView({ block: 'center' });
    }, 100);
  };

  const askDelete = (pid: number, wrongN: number) => {
    if (confirmDel === pid) {
      void deletePaper(pid);
      setConfirmDel(null);
      showToast('试卷已删除（含 ' + wrongN + ' 道错题）🗑');
      return;
    }
    setConfirmDel(pid);
    setTimeout(() => setConfirmDel((c) => (c === pid ? null : c)), 3000);
  };

  const a = analysis;
  const totalReasons = a ? Object.values(a.reasonTally).reduce((x, y) => x + y, 0) : 0;
  const shownPapers = paperFilter === '全部' ? papers : papers.filter((p) => p.subject === paperFilter);

  const toggleExam = (subject: string, v: boolean) => {
    void setSubjectHasExam(subject, v);
    showToast(v ? '「' + subject + '」已加入考试科目 ✓' : '「' + subject + '」已移出考试科目');
  };

  return (
    <section className="sh-view">
      <div className="sh-card">
        <div className="sh-wrong-bar">
          <h4 style={{ margin: 0 }}>🎯 考试科目与目标</h4>
          <button className={'sh-btn' + (examCfgOpen ? ' primary' : '')} type="button"
            onClick={() => setExamCfgOpen(!examCfgOpen)}>
            {examCfgOpen ? '收起' : '设置'}
          </button>
        </div>
        {examCfgOpen && (
          <div style={{ marginTop: 8 }}>
            <div className="sh-impnote" style={{ marginBottom: 6 }}>
              开启「考试」的科目才会出现在趋势图与薄弱分析里；目标分可按科目单独设
            </div>
            {(subjectConfigs.length ? subjectConfigs : []).map((c) => (
              <div key={c.subject} className="sh-subjrow">
                <i className="sh-dotleg" style={{ background: colors[c.subject] || '#64748b' }} />
                <span style={{ fontSize: 12.5 }}>{c.subject}</span>
                <span className="sh-switchlbl">目标</span>
                <input type="number" className="sh-targetinput" min={0} max={150} step={0.5}
                  defaultValue={c.target} key={'et' + c.subject + c.target}
                  aria-label={c.subject + ' 考试目标分'} disabled={!c.hasExam}
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (c.hasExam && !isNaN(v) && v >= 0 && v <= 150 && v !== c.target) void setSubjectTarget(c.subject, v);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
                <span className="sh-switchlbl">考试</span>
                <input type="checkbox" className="sh-switch" checked={c.hasExam} aria-label={c.subject + ' 参加考试'}
                  onChange={(e) => toggleExam(c.subject, e.target.checked)} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="sh-card">
        <h4>成绩趋势（最近几次考试）</h4>
        <div className="sh-chiprow" style={{ marginBottom: 8 }}>
          {examSubjects.map((s) => (
            <button key={s} className={'sh-cchip' + (s === chartSubject ? ' on' : '')} type="button"
              onClick={() => setChartSubject(s)}>{s}</button>
          ))}
        </div>
        <TrendChart papers={papers.filter((p) => p.subject === chartSubject)} color={colors[chartSubject] || '#64748b'}
          target={subjectConfigs.find((c) => c.subject === chartSubject)?.target ?? 90} />
      </div>

      {a && (
        <div className="sh-card sh-weak">
          <h4>薄弱科目提醒</h4>
          {a.weak ? (
            <>
              <b><span style={{ color: colors[a.weak.subject] || '#64748b' }}>●</span> {a.weak.subject}：近 {a.weak.n} 次平均 {a.weak.avg.toFixed(1)} 分（目标 {a.weak.target}）</b>
              <p>
                课程表里{a.days.length === 5 ? '每天都有' : a.days.join('、') + '有'}{a.weak.subject}课，
                建议每天课后{a.weak.subject === '数学' ? '加练口算 15 分钟' : '复习巩固 20 分钟'}，错题当天整理。
              </p>
              <div className="sh-rbar">
                {totalReasons > 0 && Object.entries(a.reasonTally).map(([k, v]) => v > 0 && (
                  <i key={k} style={{ width: (v / totalReasons) * 100 + '%', background: REASON_COLORS[k] }} />
                ))}
              </div>
              <div className="sh-rlegend">
                {totalReasons > 0 && Object.entries(a.reasonTally).map(([k, v]) => v > 0 && (
                  <span key={k}><i style={{ background: REASON_COLORS[k] }} />{k} {Math.round((v / totalReasons) * 100)}%</span>
                ))}
              </div>
            </>
          ) : <p>暂无考试数据，录入成绩后自动生成分析。</p>}
        </div>
      )}

      <div className="sh-card">
        <h4>我的试卷</h4>
        {papers.length === 0 && <div className="sh-impnote">还没有试卷，录入一次成绩试试</div>}
        {papers.length > 0 && (
          <div className="sh-chiprow" style={{ marginBottom: 8 }}>
            {['全部', ...Array.from(new Set(papers.map((x) => x.subject)))].map((sub) => (
              <button key={sub} className={'sh-cchip' + (paperFilter === sub ? ' on' : '')} type="button"
                onClick={() => setPaperFilter(sub)}>{sub}</button>
            ))}
          </div>
        )}
        {papers.length > 1 && <div className="sh-impnote" style={{ marginBottom: 6 }}>按住试卷卡片拖动可调整顺序</div>}
        {shownPapers.map((p) => {
          const col = colors[p.subject] || '#64748b';
          const openP = expanded === p.id;
          return (
            <div key={p.id} className="sh-paper" draggable
              onDragStart={() => { dragIdRef.current = p.id; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIdRef.current;
                dragIdRef.current = null;
                if (from == null || from === p.id) return;
                const full = [...papers];
                const fi = full.findIndex((x) => x.id === from);
                const ti = full.findIndex((x) => x.id === p.id);
                if (fi < 0 || ti < 0) return;
                const [moved] = full.splice(fi, 1);
                full.splice(ti, 0, moved);
                void reorderPapers(full.map((x) => x.id));
              }}>
              <button className="sh-paper-head" type="button" aria-expanded={openP}
                onClick={() => setExpanded(openP ? null : p.id)}>
                <span className="sh-thumb">{p.hasPhoto ? '🖼️' : '📄'}</span>
                <span className="sh-paper-main">
                  <span className="sh-paper-title"><span style={{ color: col }}>{p.subject}</span> · {p.unit}</span>
                  <span className="sh-meta">{p.type} · {p.date.slice(5)} · {p.wrongs.length} 道错题</span>
                </span>
                <span className="sh-score tabular-nums">{p.score}<small> /{p.fullScore}</small></span>
                <span className="sh-chev">{openP ? '▲' : '▼'}</span>
              </button>
              {openP && (
                <div className="sh-paper-wrongs">
                  <div className="sh-btnrow">
                    <button className="sh-btn" type="button" style={{ flex: 1 }}
                      onClick={() => openEdit(p.id)}>✎ 编辑试卷</button>
                    <button className={'sh-btn' + (confirmDel === p.id ? ' primary' : '')} type="button" style={{ flex: 1 }}
                      onClick={() => askDelete(p.id, p.wrongs.length)}>
                      {confirmDel === p.id ? '⚠️ 确认删除试卷' : '🗑 删除试卷'}
                    </button>
                  </div>
                  {p.wrongs.length === 0 && <div className="sh-impnote">本卷无错题，继续保持 🎉</div>}
                  {p.wrongs.map((w) => (
                    <div key={w.id} className="sh-wq-inline">
                      <div className="sh-imptxt">{w.content}</div>
                      <div className="sh-exam-sub" style={{ marginTop: 4 }}>
                        <span className="sh-tag">{w.reason}</span>
                        <span className="sh-tag" style={w.mastered ? { color: '#16a34a' } : undefined}>
                          {w.mastered ? '✓ 已掌握' : '未掌握'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="sh-impnote">{p.hasPhoto ? '🖼️ 原卷照片已保存' : '本卷未上传照片'}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sh-btnrow">
        <button className="sh-btn" type="button" style={{ flex: 1 }} onClick={() => { setFormOpen(!formOpen); }}>＋ 录入成绩</button>
        <button className="sh-btn primary" type="button" style={{ flex: 1 }}
          onClick={() => showToast('拍照识错题（OCR）后续接入：先用「＋ 录入成绩」手动记录')}>📸 拍试卷识错题</button>
      </div>

      {formOpen && (
        <div className="sh-card sh-form">
          <div className="sh-paste-head">
            <b>{editId != null ? '✎ 编辑试卷' : '＋ 录入成绩'}</b>
            <button className="sh-x" type="button" aria-label="关闭"
              onClick={() => { setFormOpen(false); setEditId(null); }}>✕</button>
          </div>
          <div className="sh-frow">
            <div className="sh-field"><label htmlFor="f-subj">科目</label>
              <select id="f-subj" className="sh-select" value={subj} onChange={(e) => setSubj(e.target.value)}>
                {[...new Set([...examSubjects, subj])].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sh-field"><label htmlFor="f-type">类型</label>
              <select id="f-type" className="sh-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option>单元测试</option><option>月考</option><option>期中</option><option>期末</option>
              </select>
            </div>
          </div>
          <div className="sh-frow">
            <div className="sh-field"><label htmlFor="f-score">得分</label>
              <input id="f-score" className="sh-input" type="number" inputMode="decimal" value={score}
                placeholder="如 91" onChange={(e) => setScore(e.target.value)} />
            </div>
            <div className="sh-field"><label htmlFor="f-full">满分</label>
              <input id="f-full" className="sh-input" type="number" inputMode="decimal" value={full}
                onChange={(e) => setFull(e.target.value)} />
            </div>
            <div className="sh-field"><label htmlFor="f-unit">单元</label>
              <input id="f-unit" className="sh-input" value={unit} placeholder="第4单元"
                onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>
          <div className="sh-frow">
            <div className="sh-field"><label htmlFor="f-date">考试日期</label>
              <input id="f-date" className="sh-input" type="date" value={examDate}
                onChange={(e) => setExamDate(e.target.value)} />
            </div>
          </div>
          <div className="sh-field"><label>失分原因（可多选）</label>
            <div className="sh-rchips">
              {REASON_CATS.map((r) => (
                <button key={r} className={'sh-rchip' + (reasons.has(r) ? ' on' : '')} type="button"
                  onClick={() => {
                    const next = new Set(reasons);
                    if (next.has(r)) next.delete(r); else next.add(r);
                    setReasons(next);
                  }}>{r}</button>
              ))}
            </div>
          </div>
          {err && <p className="sh-err" role="alert">{err}</p>}
          <div className="sh-frow">
            <button className="sh-btn primary" type="button" style={{ flex: 1 }} onClick={() => void save()}>保存</button>
            <button className="sh-btn" type="button" style={{ flex: 1 }} onClick={() => setFormOpen(false)}>取消</button>
          </div>
        </div>
      )}
    </section>
  );
}
