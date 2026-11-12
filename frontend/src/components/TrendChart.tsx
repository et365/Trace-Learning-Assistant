import { useState } from 'react';
import type { PaperDto } from '../api/types';

const W = 322, H = 152, L = 34, R = 308, T = 16, B = 120;

export default function TrendChart({ papers, color, target = 90 }: { papers: PaperDto[]; color: string; target?: number }) {
  const [tip, setTip] = useState<{ p: PaperDto; x: number; y: number } | null>(null);

  // 按考试时间先后排序（左旧右新）；同日按录入先后
  const arr = [...papers].sort((a, b) => (a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1));
  const pct = (p: PaperDto) => {
    const v = (p.score / (p.fullScore || 100)) * 100;
    return Math.round(v * 10) / 10;
  };
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const xs = (i: number) => (arr.length < 2 ? (L + R) / 2 : L + ((R - L) * i) / (arr.length - 1));
  const ys = (v: number) => {
    const c = Math.max(60, Math.min(100, v));
    return B - ((B - T) * (c - 60)) / 40;
  };

  const pts = arr.map((p, i) => ({ p, x: xs(i), y: ys(pct(p)) }));
  const line = pts.map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="成绩趋势图"
        onMouseLeave={() => setTip(null)}>
        {/* 网格与纵轴 */}
        {[60, 70, 80, 90, 100].map((v) => {
          const y = ys(v);
          return (
            <g key={v}>
              <line x1={L} y1={y} x2={R} y2={y} stroke="var(--sh-line)" strokeWidth={1} />
              <text x={L - 6} y={y + 3.5} textAnchor="end" fontSize={10.5} fill="var(--sh-sub)">{v}</text>
            </g>
          );
        })}
        {/* 目标线 */}
        {(() => {
          const ty = ys(Math.max(60, Math.min(100, target)));
          return (
            <g>
              <line x1={L} y1={ty} x2={R} y2={ty} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="4 4" opacity={0.85} />
              <text x={R} y={ty - 5} textAnchor="end" fontSize={10.5} fill="#f59e0b">目标 {fmt(target)}</text>
            </g>
          );
        })()}

        {arr.length > 0 ? (
          <>
            <polyline points={line} fill="none" stroke={color} strokeWidth={2.5}
              strokeLinejoin="round" strokeLinecap="round" pointerEvents="none" />
            {pts.map(({ p, x, y }) => {
              const ly = Math.max(11, y - 9);
              return (
                <g key={p.id}>
                  {/* 透明命中区，方便悬停 */}
                  <circle cx={x} cy={y} r={9} fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setTip({ p, x, y })} />
                  <circle cx={x} cy={y} r={4} fill={color} stroke="var(--sh-card)" strokeWidth={1.5}
                    pointerEvents="none" />
                  <text x={x} y={ly} textAnchor="middle" fontSize={11} fontWeight={600}
                    fill="var(--sh-text)" pointerEvents="none">{fmt(pct(p))}</text>
                  <text x={x} y={B + 14} textAnchor="middle" fontSize={10.5}
                    fill="var(--sh-sub)" pointerEvents="none">{p.date.slice(5)}</text>
                </g>
              );
            })}
          </>
        ) : (
          <text x={(L + R) / 2} y={(T + B) / 2} textAnchor="middle" fontSize={12}
            fill="var(--sh-sub)">暂无成绩</text>
        )}
      </svg>

      {tip && (
        <div style={{
          position: 'absolute',
          left: `${(tip.x / W) * 100}%`,
          top: `${(tip.y / H) * 100}%`,
          transform: `translate(${tip.x < 90 ? '-8%' : tip.x > 240 ? '-92%' : '-50%'}, -112%)`,
          background: 'var(--sh-card)',
          border: '1px solid var(--sh-line)',
          borderRadius: 10,
          padding: '8px 10px',
          fontSize: 12,
          color: 'var(--sh-text)',
          boxShadow: '0 8px 24px light-dark(rgb(30 40 75 / 0.18), rgb(0 0 0 / 0.45))',
          pointerEvents: 'none',
          zIndex: 5,
          minWidth: 130,
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>
            {tip.p.subject} · {tip.p.type} <span style={{ color: 'var(--sh-sub)', fontWeight: 400 }}>{tip.p.date.slice(5)}</span>
          </div>
          <div style={{ color: 'var(--sh-sub)' }}>单元：{tip.p.unit}</div>
          <div>得分 <b className="tabular-nums">{tip.p.score}</b> / {tip.p.fullScore}
            <span style={{ color: 'var(--sh-sub)' }}>（{fmt(pct(tip.p))}%）</span></div>
          {tip.p.reasons.length > 0 && (
            <div style={{ color: 'var(--sh-sub)' }}>失分：{tip.p.reasons.join('、')}</div>
          )}
          <div style={{ color: 'var(--sh-sub)' }}>错题 {tip.p.wrongs.length} 道</div>
        </div>
      )}
    </div>
  );
}
