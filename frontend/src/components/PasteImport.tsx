import { useState } from 'react';
import { post } from '../api/client';
import type { ParsedHomework, ParsedItem } from '../api/types';
import { useAppStore } from '../stores/appStore';

const SAMPLE = '【今日语文】\n1.复习：背诵+练默写《鹿柴》\n2.仿写第二面四道题。\n注意：部分同学再次订正语文作业本，弄懂错题哦![加油干]\n3.日记+阅读+自主提高【提高内容练字或阅读练习】';

export default function PasteImport({ slotId, onDone }: { slotId: number; onDone: () => void }) {
  const { addItem, showToast } = useAppStore();
  const [text, setText] = useState(SAMPLE);
  const [parsed, setParsed] = useState<ParsedHomework | null>(null);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [busy, setBusy] = useState(false);

  const parse = async () => {
    try {
      const r = await post<ParsedHomework>('/ai/parse-homework', { text });
      setParsed(r);
      setKeep(r.items.map(() => true));
    } catch (e) {
      showToast(e instanceof Error ? e.message : '解析失败');
    }
  };

  const updateItem = (j: number, patch: Partial<ParsedItem>) => {
    setParsed((p) => (p ? { ...p, items: p.items.map((it, x) => (x === j ? { ...it, ...patch } : it)) } : p));
  };

  const removeItem = (j: number) => {
    setParsed((p) => (p ? { ...p, items: p.items.filter((_, x) => x !== j) } : p));
    setKeep((k) => k.filter((_, x) => x !== j));
  };

  const importAll = async () => {
    if (!parsed) return;
    setBusy(true);
    let n = 0;
    for (let i = 0; i < parsed.items.length; i++) {
      if (!keep[i]) continue;
      const it = parsed.items[i];
      await addItem(slotId, 'T', it.txt, it.note || '');
      n++;
    }
    setBusy(false);
    showToast(n > 0 ? '已导入 ' + n + ' 项作业到本课 ✓' : '未选择任何项');
    onDone();
  };

  const keptCount = keep.filter(Boolean).length;

  return (
    <div className="sh-addrow">
      <div className="sh-paste-head">
        <b>📋 粘贴老师消息导入</b>
        <button className="sh-x" type="button" onClick={onDone} aria-label="关闭导入">✕</button>
      </div>
      <textarea className="sh-input sh-ta" rows={6} value={text} aria-label="老师布置的作业原文"
        onChange={(e) => setText(e.target.value)} />
      <div className="sh-addinput">
        <button className="sh-btn primary" type="button" onClick={() => void parse()}>解析</button>
        <button className="sh-btn" type="button" onClick={() => setText(SAMPLE)}>恢复示例</button>
      </div>
      {parsed && (
        <>
          <div className="sh-impnote">
            识别科目：{parsed.subject ?? '未识别（导入当前科目）'} · 解析出 {parsed.items.length} 项，内容可直接编辑
          </div>
          <div className="sh-implist">
            {parsed.items.map((it, j) => (
              <div key={j} className={'sh-impitem' + (keep[j] ? '' : ' off')}>
                <button className={'sh-impchk' + (keep[j] ? ' on' : '')} type="button" aria-pressed={keep[j]}
                  aria-label={`导入第${j + 1}条`}
                  onClick={() => setKeep(keep.map((k, x) => (x === j ? !k : k)))}>✓</button>
                <div className="sh-impmain">
                  <div className="sh-impeditrow">
                    <input className="sh-impedit" value={it.txt} aria-label={`第${j + 1}条内容`}
                      onChange={(e) => updateItem(j, { txt: e.target.value })} />
                    <button className={'sh-tag sh-optbtn' + (it.optional ? ' opt' : '')} type="button"
                      aria-label={`切换第${j + 1}条必做或选做`}
                      onClick={() => updateItem(j, { optional: !it.optional })}>
                      {it.optional ? '⚠️ 选做' : '必做'}
                    </button>
                    <button className="sh-x" type="button" aria-label={`删除第${j + 1}条`}
                      onClick={() => removeItem(j)}>✕</button>
                  </div>
                  <input className="sh-impedit" style={{ fontSize: 11, color: 'var(--sh-sub)' }} value={it.note}
                    aria-label={`第${j + 1}条备注`} placeholder="备注（可编辑）"
                    onChange={(e) => updateItem(j, { note: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
          <button className="sh-btn primary block" type="button" disabled={keptCount === 0 || busy}
            onClick={() => void importAll()}>
            {keptCount > 0 ? '导入 ' + keptCount + ' 项作业' : '请至少勾选一项'}
          </button>
        </>
      )}
      {!parsed && (
        <div className="sh-note">解析后每一条都能直接编辑：改内容、改备注、切换必做/选做、删除不要的项</div>
      )}
    </div>
  );
}
