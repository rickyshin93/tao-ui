/* Phone screen for the home page's mobile story. Runs inside an independent
 * 390px iframe viewport, so Select and DatePicker resolve their real mobile
 * drawers. The parent page posts { type: 'home-phone', scene, seed }. */
import {
  Button,
  DatePicker,
  FormField,
  Select,
  Switch,
  TaoProvider,
  zhCN,
} from '@rockshin/tao-ui';
import { useEffect, useRef, useState } from 'react';

// Scripted opens must not pull the parent page: Radix focuses the popup on open,
// which would scroll the home page back to this iframe and steal keyboard focus.
// Only move focus once the visitor is actually inside this frame, never scrolling.
if (typeof window !== 'undefined' && window.parent !== window) {
  const nativeFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focus(options?: FocusOptions) {
    if (!document.hasFocus()) return;
    nativeFocus.call(this, { ...options, preventScroll: true });
  };
}

type Scene = 'select' | 'pick' | 'multi' | 'date' | 'touch' | 'idle';
type Surface = 'select' | 'multi' | 'date';

const copy = {
  zh: {
    title: '新建行程',
    sub: '周末去哪儿',
    city: '目的地',
    tags: '同行偏好',
    tagsHolder: '选几个关键词',
    date: '出发日期',
    remind: '出发前提醒我',
    save: '保存行程',
    cities: ['杭州', '成都', '大理', '厦门', '青岛', '西安'],
    topics: ['美食', '徒步', '博物馆', '咖啡', '夜景', '温泉'],
  },
  en: {
    title: 'New trip',
    sub: 'Where to this weekend',
    city: 'Destination',
    tags: 'Interests',
    tagsHolder: 'Pick a few',
    date: 'Departure',
    remind: 'Remind me before I leave',
    save: 'Save trip',
    cities: ['Lisbon', 'Kyoto', 'Oaxaca', 'Tallinn', 'Hobart', 'Porto'],
    topics: [
      'Food',
      'Hiking',
      'Museums',
      'Coffee',
      'Night views',
      'Hot springs',
    ],
  },
};

export default function HomePhoneDemo({ zh = false }: { zh?: boolean }) {
  const t = zh ? copy.zh : copy.en;
  const [seed, setSeed] = useState<string | undefined>();
  const [scene, setScene] = useState<Scene>('select');
  const [open, setOpen] = useState<Surface | null>(null);
  const [chrome, setChrome] = useState<'phone' | 'window'>('phone');
  const [city, setCity] = useState<string | undefined>(t.cities[0]);
  const [topics, setTopics] = useState<string[]>([t.topics[0], t.topics[3]]);
  const [remind, setRemind] = useState(true);
  const manual = useRef(false);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.type !== 'home-phone')
        return;
      if (event.data.seed) setSeed(event.data.seed);
      if (event.data.scene) setScene(event.data.scene);
      if (event.data.chrome) setChrome(event.data.chrome);
    };
    const takeOver = () => {
      manual.current = true;
      window.parent.postMessage({ type: 'home-phone-manual' }, '*');
    };
    window.addEventListener('message', receive);
    window.addEventListener('pointerdown', takeOver);
    window.parent.postMessage({ type: 'home-phone-ready' }, '*');
    return () => {
      window.removeEventListener('message', receive);
      window.removeEventListener('pointerdown', takeOver);
    };
  }, []);

  // Each scene opens its surface; the single-select scene keeps demonstrating
  // pick-and-commit until the visitor touches the phone.
  useEffect(() => {
    setOpen(null);
    if (scene === 'touch' || scene === 'idle') return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));
    at(400, () => setOpen(scene === 'pick' ? 'select' : scene));
    if (scene === 'pick') {
      at(2200, () => {
        setCity(
          (current) =>
            t.cities[(t.cities.indexOf(current ?? '') + 1) % t.cities.length],
        );
        setOpen(null);
      });
    }
    if (scene === 'select') {
      let step = 0;
      const loop = () => {
        if (manual.current) return;
        step += 1;
        setCity(t.cities[step % t.cities.length]);
        setOpen(null);
        at(1100, () => {
          if (manual.current) return;
          setOpen('select');
          at(1500, loop);
        });
      };
      at(2100, loop);
    }
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [scene, t.cities]);

  const openProps = (id: Surface) => ({
    open: open === id,
    onOpenChange: (next: boolean) => setOpen(next ? id : null),
  });

  return (
    <TaoProvider
      locale={zh ? zhCN : undefined}
      theme={seed ? { token: { colorPrimary: seed } } : undefined}
    >
      <style>{`
        .hp { display: grid; gap: 20px; align-content: start; min-height: 100dvh; margin: -24px; padding: 24px 20px; }
        .hp[data-chrome="phone"] { padding-top: 68px; }
        @media (min-width: 576px) {
          .hp { grid-template-columns: 1fr 1fr; column-gap: 16px; max-width: 680px; margin: -24px auto; padding: 36px 32px; }
          .hp-wide { grid-column: 1 / -1; }
        }
      `}</style>
      <div className="hp" data-chrome={chrome}>
        <header
          className="hp-wide"
          style={{ display: 'grid', gap: 2, paddingBottom: 4 }}
        >
          <span style={{ opacity: 0.6, fontSize: 13 }}>{t.sub}</span>
          <strong
            style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            {t.title}
          </strong>
        </header>
        <FormField label={t.city}>
          <Select
            {...openProps('select')}
            value={city}
            onChange={(value) => setCity(value as string)}
            showSearch
            style={{ width: '100%' }}
            options={t.cities.map((value) => ({ label: value, value }))}
          />
        </FormField>
        <FormField label={t.date}>
          <DatePicker
            {...openProps('date')}
            allowClear
            style={{ width: '100%' }}
          />
        </FormField>
        <div className="hp-wide">
          <FormField label={t.tags}>
            <Select
              {...openProps('multi')}
              mode="multiple"
              value={topics}
              placeholder={t.tagsHolder}
              onChange={(value) => setTopics(value as string[])}
              style={{ width: '100%' }}
              options={t.topics.map((value) => ({ label: value, value }))}
            />
          </FormField>
        </div>
        <div
          className="hp-wide"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            minHeight: 44,
          }}
        >
          {t.remind}
          <Switch checked={remind} onChange={setRemind} aria-label={t.remind} />
        </div>
        <div className="hp-wide">
          <Button size="large" style={{ width: '100%', marginTop: 8 }}>
            {t.save}
          </Button>
        </div>
      </div>
    </TaoProvider>
  );
}
