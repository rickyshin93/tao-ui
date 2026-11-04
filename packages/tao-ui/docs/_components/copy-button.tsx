import { useLang } from '@rspress/core/runtime';
import { useState } from 'react';

export function CopyButton({
  text,
  label,
}: {
  text: string | (() => string);
  label: string;
}) {
  const zh = useLang() === 'zh';
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        typeof text === 'function' ? text() : text,
      );
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return (
    <span className="tao-copy">
      <button
        type="button"
        className="tao-doc-action"
        onClick={copy}
        onBlur={() => setStatus('idle')}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {status === 'copied' ? (
            <path d="m4 10 4 4 8-8" />
          ) : (
            <>
              <rect x="7" y="7" width="10" height="10" rx="2" />
              <path d="M12 4V3H3v9h1" />
            </>
          )}
        </svg>
        <span aria-live="polite">
          {status === 'copied' ? (zh ? '已复制' : 'Copied') : label}
        </span>
      </button>
      {status === 'error' && (
        <span role="alert" className="tao-copy-error">
          {zh
            ? '复制失败，请手动选择代码复制。'
            : 'Copy failed. Select and copy the code manually.'}
        </span>
      )}
    </span>
  );
}
