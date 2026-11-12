import { useState } from 'react';
import { HW_TYPE } from '../api/types';

const TYPES = ['T', 'F', 'K'] as const;

export default function ItemEditForm({ initial, onSave, onCancel }: {
  initial: { type: string; content: string; note: string };
  onSave: (v: { type: string; content: string; note: string }) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState(initial.type);
  const [content, setContent] = useState(initial.content);
  const [note, setNote] = useState(initial.note);

  const save = () => {
    if (!content.trim()) return;
    onSave({ type, content: content.trim(), note: note.trim() });
  };

  return (
    <div className="sh-addrow" style={{ flex: 1 }}>
      <div className="sh-addtypes">
        {TYPES.map((t) => (
          <button key={t} className={'sh-cchip' + (type === t ? ' on' : '')} type="button"
            onClick={() => setType(t)}>{HW_TYPE[t]}</button>
        ))}
      </div>
      <input className="sh-input" value={content} aria-label="作业内容"
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }} />
      <input className="sh-input" value={note} aria-label="备注" placeholder="备注（可留空）"
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }} />
      <div className="sh-btnrow">
        <button className="sh-btn primary" type="button" style={{ flex: 1 }} onClick={save}>保存</button>
        <button className="sh-btn" type="button" style={{ flex: 1 }} onClick={onCancel}>取消</button>
      </div>
    </div>
  );
}
