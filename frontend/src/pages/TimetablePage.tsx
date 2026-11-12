import { Fragment } from 'react';
import { useAppStore } from '../stores/appStore';
import { DAYS, PERIODS, type SubjectConfigDto } from '../api/types';

export default function TimetablePage() {
  const { slots, openSlot, subjectConfigs, setSubjectNoHomework, setSubjectColor, setSubjectTarget, colors } = useAppStore();

  if (slots.length === 0) return <div className="sh-view"><div className="sh-card">加载中…</div></div>;

  const used = new Set(slots.map((s) => s.subject));

  const cfgMap: Record<string, boolean> = {};
  subjectConfigs.forEach((c) => { cfgMap[c.subject] = c.noHomework; });
  const configRows = (configs: SubjectConfigDto[], usedSet: Set<string>) => {
    const rows = configs.map((c) => ({ subject: c.subject, noHomework: c.noHomework, target: c.target }));
    for (const s of usedSet) if (!(s in cfgMap)) rows.push({ subject: s, noHomework: false, target: 90 });
    return rows.sort((a, b) => (a.noHomework === b.noHomework ? 0 : a.noHomework ? -1 : 1));
  };
  const cell = (d: number, r: number) => slots.find((s) => s.dayOfWeek === d && s.periodIndex === r);

  return (
    <section className="sh-view">
      <div className="sh-card">
        <div className="sh-weekbar"><b>我的课程表</b><span className="sh-pill">点击格子可编辑课程</span></div>
      </div>
      <div className="sh-card">
        <div className="sh-tt">
          <div className="hd"></div>
          {DAYS.slice(1).map((d) => <div key={d} className="hd">{d}</div>)}
          {PERIODS.map((p, r) => (
            <Fragment key={r}>
              <div className="ph"><span>{p.name}</span><span className="tm">{p.time}</span></div>
              {DAYS.slice(1).map((_, di) => {
                const d = di + 1;
                const s = cell(d, r);
                if (!s) return <div key={d + '-' + r} className="sh-cell" />;
                const col = colors[s.subject] || '#64748b';
                return (
                  <button key={d + '-' + r} className={'sh-cell' + (s.hasPlan ? ' sh-cell-has' : '')} type="button"
                    style={{ background: col }} aria-label={DAYS[d] + p.name + ' ' + s.subject}
                    onClick={() => openSlot(s.id)}>{s.subject}</button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="sh-legend">
        {[...used].map((s) => (
          <span key={s}><i style={{ background: colors[s] || '#64748b' }} />{s}</span>
        ))}
      </div>
      <div className="sh-card">
        <h4>科目设置</h4>
        <div className="sh-impnote" style={{ marginBottom: 6 }}>开启「无课后作业」的科目不会出现在今日任务里</div>
        {configRows(subjectConfigs, used).map((c) => (
          <div key={c.subject} className="sh-subjrow">
            <input type="color" className="sh-colordot" value={colors[c.subject] || '#64748b'}
              aria-label={c.subject + ' 颜色'}
              onChange={(e) => void setSubjectColor(c.subject, e.target.value)} />
            <span style={{ fontSize: 12.5 }}>{c.subject}</span>
            <span className="sh-switchlbl">目标</span>
            <input type="number" className="sh-targetinput" min={0} max={150} step={0.5}
              defaultValue={c.target} key={'t' + c.subject + c.target}
              aria-label={c.subject + ' 考试目标分'}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v >= 0 && v <= 150 && v !== c.target) void setSubjectTarget(c.subject, v);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
            <span className="sh-switchlbl">无课后作业</span>
            <input type="checkbox" className="sh-switch" checked={c.noHomework} aria-label={c.subject + ' 无课后作业'}
              onChange={(e) => void setSubjectNoHomework(c.subject, e.target.checked)} />
          </div>
        ))}
      </div>
      <div className="sh-hint">👆 点格子编辑课程：换科目 · 记所学 · 布作业任务（白点 = 已安排）</div>
    </section>
  );
}
