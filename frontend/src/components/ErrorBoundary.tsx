import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** 渲染兜底：出错时显示可恢复的错误页，而不是让页面静默冻结 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // 本地单用户应用：控制台留痕即可
    // eslint-disable-next-line no-console
    console.error('页面渲染出错：', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center', background: '#eef1f8', color: '#212738' }}>
          <div style={{ fontSize: 40 }}>😔</div>
          <h2 style={{ margin: 0, fontSize: 18 }}>页面出错了</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7390', maxWidth: 320, wordBreak: 'break-all' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: '10px 28px', borderRadius: 999, border: 'none', background: '#4f7cff', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            刷新恢复
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
