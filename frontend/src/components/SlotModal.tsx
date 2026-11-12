import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { SUBJECT_CYCLE } from '../api/types';
import ItemEditForm from './ItemEditForm';

export default function SlotModal() {
  const { slotEdit, closeSlot, updateSlot, addItem, deleteItem, setItemDone, updateItem } = useAppStore();
  const [newType, setNewType] = useState<'T' | 'F' | 'K'>('T');
  const [newTxt, setNewTxt] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  if (!slotEdit) return null;
  const s = slotEdit;

  const add = () => {
    if (!newTxt.trim()) return;
    void addItem(s.id, newType, newTxt.trim());
    setNewTxt('');
  };

  return (
    <div className="sh-modal">
      <div className="sh-modal-card sh-form">
        <div className="sh-paste-head">
          <b>{s.dayName} · {s.periodName} {s.time}</b>
          <button className="sh-x" type="button" onClick={closeSlot} aria-label="关闭">✕</button>
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <label>科目</label>
          <div className="sh-chiprow">
            {SUBJECT_CYCLE.map((subj) => (
              <button key={subj} className={'sh-cchip' + (s.subject === subj ? ' on' : '')} type="button"
                onClick={() => void updateSlot(s.id, { subject: subj })}>{subj}</button>
            ))}
          </div>
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <label htmlFor="slot-lesson">📖 学习内容</label>
          <input key={'l' + s.id + s.lesson} id="slot-lesson" className="sh-input" defaultValue={s.lesson}
            placeholder="这节课学了什么" onBlur={(e) => void updateSlot(s.id, { lesson: e.target.value.trim() })} />
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <label>⭐ 掌握度</label>
          <div className="sh-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={'sh-star' + (n <= s.mastery ? ' on' : '')} type="button"
                onClick={() => void updateSlot(s.id, { mastery: n })} aria-label={n + '星'}>★</button>
            ))}
            <span className="sh-mval">{s.mastery ? s.mastery + ' 星' : '未评'}</span>
          </div>
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <label htmlFor="slot-note">💬 疑问 / 备注</label>
          <input key={'n' + s.id + s.note} id="slot-note" className="sh-input" defaultValue={s.note}
            placeholder="哪里没听懂，记一下" onBlur={(e) => void updateSlot(s.id, { note: e.target.value.trim() })} />
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <button className={'sh-btn' + (s.noHomework ? ' primary' : '')} type="button" aria-pressed={s.noHomework}
            onClick={() => void updateSlot(s.id, { noHomework: !s.noHomework })}>
            {s.noHomework ? '✅ 已标记：这节课无作业' : '🚫 标记为无作业'}
          </button>
        </div>
        <div className="sh-field" style={{ marginTop: 8 }}>
          <label>📝 作业 / 任务</label>
          <div className="sh-implist">
            {s.items.length === 0 && <div className="sh-impnote">还没有安排，在下面添加作业或任务</div>}
            {s.items.map((it) => (
              <div key={it.id} className={'sh-impitem' + (it.done ? ' off' : '')}>
                {editId === it.id ? (
                  <ItemEditForm
                    initial={{ type: it.type, content: it.content, note: it.note }}
                    onSave={(v) => { void updateItem(it.id, v); setEditId(null); }}
                    onCancel={() => setEditId(null)} />
                ) : (
                  <>
                    <button className={'sh-impchk' + (it.done ? ' on' : '')} type="button" aria-pressed={it.done}
                      onClick={() => void setItemDone(it.id, !it.done)}>✓</button>
                    <div className="sh-impmain">
                      <div className="sh-imptxt"><span className={'sh-tbadge ' + it.type.toLowerCase()}>{it.typeLabel}</span> {it.content}</div>
                      {it.note && <div className="sh-impnote">{it.note}</div>}
                    </div>
                    <button className="sh-miniact" type="button" aria-label="编辑该条"
                      onClick={() => setEditId(it.id)}>✎</button>
                    <button className="sh-x" type="button" aria-label="删除该条"
                      onClick={() => void deleteItem(s.id, it.id)}>✕</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="sh-addinput" style={{ marginTop: 6 }}>
            <select className="sh-select" style={{ width: 'auto' }} value={newType}
              onChange={(e) => setNewType(e.target.value as 'T' | 'F' | 'K')} aria-label="类型">
              <option value="T">🏫 课堂作业</option>
              <option value="F">🏠 家庭加练</option>
              <option value="K">📌 任务</option>
            </select>
            <input className="sh-input" value={newTxt} placeholder="如：预习下一课 / 带彩笔"
              onChange={(e) => setNewTxt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
            <button className="sh-btn primary" type="button" onClick={add}>添加</button>
          </div>
        </div>
        <button className="sh-btn primary block" type="button" style={{ marginTop: 10 }} onClick={closeSlot}>完成</button>
        <div className="sh-hint" style={{ marginTop: 6 }}>与「今日」实时同步 · 已安排内容的格子会显示白点</div>
      </div>
    </div>
  );
}
