import { useEffect } from 'react';
import { useAppStore, type View } from './stores/appStore';
import TodayPage from './pages/TodayPage';
import TimetablePage from './pages/TimetablePage';
import ExamPage from './pages/ExamPage';
import WrongBookPage from './pages/WrongBookPage';
import ReportPage from './pages/ReportPage';
import SlotModal from './components/SlotModal';

const TABS: { v: View; ico: string; label: string }[] = [
  { v: 'today', ico: '📋', label: '今日' },
  { v: 'table', ico: '🗓️', label: '课程表' },
  { v: 'exam', ico: '📝', label: '考试' },
  { v: 'wrong', ico: '📕', label: '错题本' },
  { v: 'report', ico: '🌟', label: '总结' }
];

export default function App() {
  const { view, setView, load, stars, toast } = useAppStore();

  useEffect(() => { void load('today'); }, [load]);

  return (
    <div className="sh-app">
      <div className="sh-phone">
        <header className="sh-appbar">
          <div>
            <div className="sh-appname">🎒 学习小管家</div>
            <div className="sh-appsub">丹枫实验小学 · 三年级(8)班 · v2511</div>
          </div>
          <div className="sh-chips">
            <span className="sh-chip">⭐ <span className="tabular-nums">{stars}</span></span>
          </div>
        </header>
        <main className="sh-main">
          {view === 'today' && <TodayPage />}
          {view === 'table' && <TimetablePage />}
          {view === 'exam' && <ExamPage />}
          {view === 'wrong' && <WrongBookPage />}
          {view === 'report' && <ReportPage />}
        </main>
        <nav className="sh-tabbar" role="tablist" aria-label="主导航">
          {TABS.map((t) => (
            <button key={t.v} className={'sh-tab' + (view === t.v ? ' active' : '')} type="button" role="tab"
              aria-selected={view === t.v} onClick={() => setView(t.v)}>
              <span className="ico">{t.ico}</span>{t.label}
            </button>
          ))}
        </nav>
        <SlotModal />
        <div className={'sh-toast' + (toast ? ' on' : '')} role="status">{toast}</div>
      </div>
    </div>
  );
}
