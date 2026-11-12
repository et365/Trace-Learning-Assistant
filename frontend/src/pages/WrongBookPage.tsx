import { useState } from 'react';
import { post } from '../api/client';
import { useAppStore } from '../stores/appStore';
import type { WrongDto } from '../api/types';

const SUBJ_FILTERS = ['全部', '语文', '数学', '英语', '科学'];
const SEMESTERS = ['三年级上', '二年级下'];
const REASONS = ['粗心马虎', '没掌握', '没复习'];

export default function WrongBookPage() {
  const {
    wrongs, trash, wrongSubject, wrongSemester, setWrongFilter,
    toggleMastered, deleteWrong, restoreWrong, deleteWrongPermanent, emptyTrash,
    startReview, load, showToast, colors
  } = useAppStore();
  const [view, setView] = useState<'book' | 'trash'>('book');
  const [showAdd, setShowAdd] = useState(false);
  const [addSubject, setAddSubject] = useState('数学');
  const [addContent, setAddContent] = useState('');
  const [addReason, setAddReason] = useState('没掌握');
  const [addUnit, setAddUnit] = useState('');
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [permArm, setPermArm] = useState<number | null>(null);
  const [emptyArm, setEmptyArm] = useState(false);
  const openN = wrongs.filter((w) => !w.mastered).length;

  const save = async () => {
    if (!addContent.trim()) { showToast('请填写薄弱知识点内容'); return; }
    await post('/wrongs', {
      subject: addSubject,
      semester: wrongSemester,
      unit: addUnit.trim() || null,
      content: addContent.trim(),
      reason: addReason
    });
    setAddContent(''); setAddUnit('');
    setShowAdd(false);
    showToast('已添加薄弱知识点 ✓');
    await load('wrong');
  };

  const askDelete = (id: number) => {
    if (confirmDel === id) {
      void deleteWrong(id);
      setConfirmDel(null);
      showToast('已移入废纸篓 🗑');
      return;
    }
    setConfirmDel(id);
    setTimeout(() => setConfirmDel((c) => (c === id ? null : c)), 3000);
  };

  const askPermanent = (id: number) => {
    if (permArm === id) {
      void deleteWrongPermanent(id);
      setPermArm(null);
      showToast('已彻底删除');
      return;
    }
    setPermArm(id);
    setTimeout(() => setPermArm((c) => (c === id ? null : c)), 3000);
  };

  const askEmpty = () => {
    if (emptyArm) {
      void emptyTrash();
      setEmptyArm(false);
      showToast('废纸篓已清空');
      return;
    }
    setEmptyArm(true);
    setTimeout(() => setEmptyArm(false), 3000);
  };

  const tipFor = (w: WrongDto) =>
    w.reason === '粗心马虎' ? '建议：审题圈关键词，做完回头检查'
      : w.reason === '没复习' ? '建议：考前过一遍该单元'
        : '建议：回课本重学该知识点';

  const bookCard = (w: WrongDto) => {
    const col = colors[w.subject] || '#64748b';
    const tip = tipFor(w);
    return (
      <div key={w.id} className="sh-wq">
        <div className="sh-wq-top">
          <span className="sh-subj" style={{ background: col, fontSize: 11.5, padding: '1px 8px' }}>{w.subject}</span>
          <span className="sh-meta">
            {[w.date && w.date.slice(5), w.unit, w.type].filter(Boolean).join(' · ') || '薄弱知识点'}
          </span>
          <button className={'sh-wq-toggle' + (w.mastered ? ' on' : '')} type="button" aria-pressed={w.mastered}
            onClick={() => void toggleMastered(w.id, !w.mastered)}>
            {w.mastered ? '✓ 已掌握' : '未掌握'}
          </button>
        </div>
        <div className="sh-wq-txt">{w.content}</div>
        <div className="sh-exam-sub">
          <span className="sh-tag">原因：{w.reason}</span>
          <span className="sh-tag">{w.paperId ? '来源：试卷' : '来源：手动添加'}</span>
          {w.reviewStage != null && (
            <span className="sh-tag" style={{ background: 'color-mix(in srgb, var(--sh-primary) 15%, transparent)', color: 'var(--sh-primary)' }}>
              🔁 复习中（第 {w.reviewStage} 次）
            </span>
          )}
          <span className="sh-tag">{tip}</span>
          {!w.mastered && w.reviewStage == null && (
            <button className="sh-tag sh-miniact" type="button" aria-label={'开启间隔重复：' + w.content}
              onClick={() => {
                void startReview(w.id);
                showToast('已开启间隔重复，今日即可复习 🎯');
              }}>🎯 间隔重复</button>
          )}
          <button className={'sh-tag sh-miniact' + (confirmDel === w.id ? ' sh-delarm' : '')} type="button"
            aria-label={confirmDel === w.id ? '确认移入废纸篓' : '删除该条'}
            onClick={() => askDelete(w.id)}>
            {confirmDel === w.id ? '⚠️ 再点一次确认删除' : '🗑 删除'}
          </button>
        </div>
      </div>
    );
  };

  const trashCard = (w: WrongDto) => {
    const col = colors[w.subject] || '#64748b';
    return (
      <div key={w.id} className="sh-wq" style={{ opacity: 0.8 }}>
        <div className="sh-wq-top">
          <span className="sh-subj" style={{ background: col, fontSize: 11.5, padding: '1px 8px' }}>{w.subject}</span>
          <span className="sh-meta">
            {[w.deletedAt ? '删除于 ' + w.deletedAt.slice(5, 16).replace('T', ' ') : '', w.unit, w.type]
              .filter(Boolean).join(' · ') || '薄弱知识点'}
          </span>
        </div>
        <div className="sh-wq-txt">{w.content}</div>
        <div className="sh-exam-sub">
          <span className="sh-tag">原因：{w.reason}</span>
          <button className="sh-tag sh-miniact" type="button" aria-label="恢复该条"
            onClick={() => {
              void restoreWrong(w.id);
              showToast('已恢复到错题本 ♻️');
            }}>♻️ 恢复</button>
          <button className={'sh-tag sh-miniact' + (permArm === w.id ? ' sh-delarm' : '')} type="button"
            aria-label={permArm === w.id ? '确认彻底删除' : '彻底删除该条'}
            onClick={() => askPermanent(w.id)}>
            {permArm === w.id ? '⚠️ 确认清空' : '🗑 彻底删除'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="sh-view">
      <div className="sh-card">
        <div className="sh-wrong-bar">
          <h4 style={{ margin: 0 }}>错题本</h4>
          <div className="sh-chiprow">
            <button className={'sh-cchip' + (view === 'book' ? ' on' : '')} type="button"
              onClick={() => setView('book')}>📘 错题本</button>
            <button className={'sh-cchip' + (view === 'trash' ? ' on' : '')} type="button"
              onClick={() => { setView('trash'); void load('wrong'); }}>
              🗑 废纸篓（{trash.length}）
            </button>
            {view === 'book' && (
              <select className="sh-select" style={{ width: 'auto' }} value={wrongSemester} aria-label="学年学期"
                onChange={(e) => void setWrongFilter(wrongSubject, e.target.value)}>
                {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>
        </div>
        {view === 'book' && (
          <>
            <div className="sh-chiprow" style={{ marginTop: 8 }}>
              {SUBJ_FILTERS.map((s) => (
                <button key={s} className={'sh-cchip' + (wrongSubject === s ? ' on' : '')} type="button"
                  onClick={() => void setWrongFilter(s, wrongSemester)}>{s}</button>
              ))}
            </div>
            <div className="sh-mini" style={{ marginTop: 8 }}>
              共 {wrongs.length} 道 · 未掌握 {openN} · 已掌握 {wrongs.length - openN}
            </div>
            <div className="sh-btnrow" style={{ marginTop: 8 }}>
              <button className={'sh-btn' + (showAdd ? ' primary' : '')} type="button"
                onClick={() => setShowAdd(!showAdd)}>＋ 添加薄弱知识点</button>
            </div>
          </>
        )}
        {view === 'trash' && (
          <>
            <div className="sh-btnrow" style={{ marginTop: 8 }}>
              <button className={'sh-btn' + (emptyArm ? ' primary' : '')} type="button"
                disabled={trash.length === 0}
                onClick={askEmpty}>
                {emptyArm ? '⚠️ 再点一次确认清空' : '🧹 一键清空废纸篓'}
              </button>
            </div>
            <div className="sh-impnote">移入废纸篓的题目可随时恢复；「彻底删除」和「一键清空」后不可找回</div>
          </>
        )}
      </div>

      {showAdd && view === 'book' && (
        <div className="sh-card sh-form">
          <div className="sh-frow">
            <div className="sh-field"><label htmlFor="wa-subj">科目</label>
              <select id="wa-subj" className="sh-select" value={addSubject} onChange={(e) => setAddSubject(e.target.value)}>
                {['语文', '数学', '英语', '科学'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sh-field"><label htmlFor="wa-sem">学年学期</label>
              <select id="wa-sem" className="sh-select" value={wrongSemester} disabled>
                {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sh-field"><label htmlFor="wa-reason">错因</label>
              <select id="wa-reason" className="sh-select" value={addReason} onChange={(e) => setAddReason(e.target.value)}>
                {REASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="sh-field"><label htmlFor="wa-content">薄弱知识点 / 错题内容</label>
            <input id="wa-content" className="sh-input" value={addContent}
              placeholder="如：分数应用题中单位「1」找错"
              onChange={(e) => setAddContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void save(); }} />
          </div>
          <div className="sh-field"><label htmlFor="wa-unit">对应单元（可留空）</label>
            <input id="wa-unit" className="sh-input" value={addUnit} placeholder="如：第4单元；不对应单元就留空"
              onChange={(e) => setAddUnit(e.target.value)} />
          </div>
          <div className="sh-btnrow">
            <button className="sh-btn primary" type="button" style={{ flex: 1 }} onClick={() => void save()}>保存</button>
            <button className="sh-btn" type="button" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>取消</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {view === 'book' && wrongs.length === 0 && (
          <div className="sh-note">这个分类下还没有错题，去「考试」录入或手动添加 ✨</div>
        )}
        {view === 'trash' && trash.length === 0 && (
          <div className="sh-note">废纸篓是空的 ✨</div>
        )}
        {view === 'book' ? wrongs.map(bookCard) : trash.map(trashCard)}
      </div>
      <div className="sh-hint">删除的题目进入废纸篓，可随时恢复 · 在「考试」页可展开试卷回看原卷</div>
    </section>
  );
}
