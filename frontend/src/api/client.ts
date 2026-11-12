export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch('/api' + path, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j && j.message) msg = j.message;
    } catch { /* keep statusText */ }
    throw new Error(msg);
  }
  // 兼容空响应体（DELETE 等 void 接口返回 200 + 空 body，res.json() 会抛异常）
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const get = <T>(p: string) => api<T>(p);
export const post = <T>(p: string, body: unknown) => api<T>(p, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(p: string, body: unknown) => api<T>(p, { method: 'PUT', body: JSON.stringify(body) });
export const patch = <T>(p: string, body: unknown) => api<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T>(p: string) => api<T>(p, { method: 'DELETE' });


// store/契约模块热替换会产生僵尸页面（DOM 在但界面永不更新），改为强制整页刷新
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}
