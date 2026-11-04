import { TaoProvider } from '@rockshin/tao-ui';
import { useDark, useLang } from '@rspress/core/runtime';
import { type ReactNode, useId, useRef, useState } from 'react';
import { CopyButton } from './copy-button';
import { DevicePreview } from './device-preview';

// The Preview plugin supplies the highlighted code followed by the live demo.
export default function Preview({
  children,
  previewMode,
  demoId,
}: {
  children: ReactNode[];
  previewMode?: 'internal' | 'iframe-follow';
  demoId?: string;
}) {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const [expanded, setExpanded] = useState(false);
  const codeId = useId();
  const codeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tao-preview rp-not-doc">
      {previewMode === 'iframe-follow' ? (
        <DevicePreview demoId={demoId!} />
      ) : (
        <div className="tao-preview-stage">
          <TaoProvider theme={{ mode: dark ? 'dark' : 'light' }}>
            <div className="tao-preview-content">{children[1]}</div>
          </TaoProvider>
        </div>
      )}
      <div className="tao-preview-toolbar">
        <span className="tao-preview-language">TSX</span>
        <CopyButton
          text={() => codeRef.current!.querySelector('code')!.textContent!}
          label={zh ? '复制代码' : 'Copy code'}
        />
        <button
          type="button"
          className="tao-doc-action"
          aria-expanded={expanded}
          aria-controls={codeId}
          onClick={() => setExpanded(!expanded)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m6 6-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" />
          </svg>
          {expanded
            ? zh
              ? '收起代码'
              : 'Hide code'
            : zh
              ? '展开代码'
              : 'Show code'}
        </button>
      </div>
      <div
        id={codeId}
        ref={codeRef}
        hidden={!expanded}
        className="tao-preview-code"
      >
        {children[0]}
      </div>
    </div>
  );
}
