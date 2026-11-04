import { TaoProvider } from '@rockshin/tao-ui';
import { type ReactNode, useEffect, useState } from 'react';
import './iframe-demo.css';

export function IframeDemoRoot({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const receiveTheme = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === 'theme-change')
        setDark(event.data.dark);
    };
    window.addEventListener('message', receiveTheme);
    window.parent.postMessage({ type: 'tao-demo-ready' }, '*');
    return () => window.removeEventListener('message', receiveTheme);
  }, []);
  return (
    <TaoProvider theme={{ mode: dark ? 'dark' : 'light' }}>
      <div className="tao-iframe-demo">{children}</div>
    </TaoProvider>
  );
}
