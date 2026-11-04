import { useDark, useLang, withBase } from '@rspress/core/runtime';
import { useEffect, useRef, useState } from 'react';

export function DevicePreview({ demoId }: { demoId: string }) {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const [mobile, setMobile] = useState(true);
  const [availableWidth, setAvailableWidth] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const width = mobile ? 414 : 960;
  const height = mobile ? 700 : 560;
  const scale = availableWidth ? Math.min(1, availableWidth / width) : 1;
  const src =
    import.meta.env.DEV && process.env.RSPRESS_IFRAME_DEV_PORT
      ? `http://${window.location.hostname}:${process.env.RSPRESS_IFRAME_DEV_PORT}/${demoId}`
      : withBase(`/~demo/${demoId}`);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setAvailableWidth(entry.contentRect.width),
    );
    observer.observe(container.current!);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const sendTheme = () =>
      iframe.current?.contentWindow?.postMessage(
        { type: 'theme-change', dark },
        '*',
      );
    const receiveReady = (event: MessageEvent) => {
      if (
        event.source === iframe.current?.contentWindow &&
        event.data?.type === 'tao-demo-ready'
      )
        sendTheme();
    };
    window.addEventListener('message', receiveReady);
    sendTheme();
    return () => window.removeEventListener('message', receiveReady);
  }, [dark]);

  return (
    <div className="tao-device-preview">
      <fieldset
        className="tao-device-toolbar"
        aria-label={zh ? '预览设备' : 'Preview device'}
      >
        <div className="tao-device-options">
          <button
            type="button"
            aria-pressed={!mobile}
            onClick={() => setMobile(false)}
          >
            {zh ? '桌面' : 'Desktop'}
          </button>
          <button
            type="button"
            aria-pressed={mobile}
            onClick={() => setMobile(true)}
          >
            {zh ? '手机' : 'Phone'}
          </button>
        </div>
        <span>{mobile ? '390 × 640' : '960 × 560'}</span>
      </fieldset>
      <div ref={container} className="tao-device-viewport">
        <div style={{ width: width * scale, height: height * scale }}>
          <div
            className={
              mobile ? 'tao-device-frame tao-device-phone' : 'tao-device-frame'
            }
            style={{ width, height, transform: `scale(${scale})` }}
          >
            {mobile && (
              <div className="tao-device-speaker" aria-hidden="true" />
            )}
            <iframe
              ref={iframe}
              src={src}
              title={
                zh
                  ? '独立视口交互演示'
                  : 'Interactive demo in an independent viewport'
              }
              loading="lazy"
              style={{ width: mobile ? 390 : 960, height: mobile ? 640 : 560 }}
              onLoad={() =>
                iframe.current?.contentWindow?.postMessage(
                  { type: 'theme-change', dark },
                  '*',
                )
              }
            />
            {mobile && <div className="tao-device-home" aria-hidden="true" />}
          </div>
        </div>
      </div>
    </div>
  );
}
