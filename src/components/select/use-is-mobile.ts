import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 479px)';

export function useIsMobile(): boolean {
  // Keep the server and first client render identical. The media query is
  // applied after hydration, avoiding desktop/mobile markup mismatches.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
