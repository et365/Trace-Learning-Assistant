import { useAppStore } from '../stores/appStore';


export default function ReportPage() {
  const { report, lessons, showToast, colors } = useAppStore();

  if (!report) return <div className="sh-view"><div className="sh-card">加载中…</div></div>;

  return (
    <section className="sh-view">
      <div className="sh-card">
        <h4>本周概览</h4>
        <div className="sh-stats3">
          <div className="sh-stat"><b className="tabular-nums">{report.completionRate}%</b><span>作业完成率</span></div>
          <div className="sh-stat"><b className="tabular-nums">{report.checkinDays}/5</b><span>打卡天数</span></div>
          <div className="sh-stat"><b>+{report.starsThisWeek} ⭐</b><span>本周星星</span></div>
        </div>
      </div>

      <div className="sh-card">
        <h4>📖 本周所学（按天 × 科目）</h4>
        {lessons.length === 0 && <div className="sh-note">本周还没有记录，在「今日」或「课程表」里记下所学内容吧</div>}
        {lessons.map((d) => (
          <div key={d.day} className="sh-wlday">
            <span className="sh-wlday-lbl">{d.day}</span>
            {d.entries.map((e, i) => {
              const col = colors[e.subject] || '#64748b';
              return (
                <div key={i} className="sh-wlrow">
                  <span className="sh-subj" style={{ background: col, fontSize: 11, padding: '1px 7px', flex: 'none' }}>{e.subject}</span>
                  <span className="sh-wltxt">{e.periodName} · {e.lesson}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div className="sh-mini">每天下课后随手记一笔，周末就能回看完整一周 ✨</div>
      </div>

      <div className="sh-card">
        <h4>科目掌握度（自评均值）</h4>
        {report.mastery.length === 0 && <div className="sh-impnote">暂无自评数据</div>}
        {report.mastery.map((m) => {
          const col = colors[m.subject] || '#64748b';
          return (
            <div key={m.subject} className="sh-mrow">
              <span className="sh-mname">{m.subject}</span>
              <div className="sh-track"><div className="sh-fill" style={{ width: m.pct + '%', background: col }} /></div>
              <span className="sh-mpct tabular-nums">{m.pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="sh-card">
        <h4>考试小结</h4>
        <p className="sh-rep-txt">{report.exam.summary}</p>
      </div>

      <div className="sh-card">
        <h4>成长建议</h4>
        <ul className="sh-tips">
          <li>🔵 弱科优先：按「薄弱提醒」的建议安排每天课后巩固。</li>
          <li>🟠 错题回顾：错题本里「未掌握」的题周末集中过一遍。</li>
          <li>🟢 保持打卡：连续打卡有助于习惯养成，别断哦。</li>
        </ul>
      </div>

      <button className="sh-btn primary block" type="button"
        onClick={() => showToast('已生成家长周报卡片（演示）✨')}>生成家长周报卡片</button>
    </section>
  );
}
