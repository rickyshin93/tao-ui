import { useDark, useLang, withBase } from '@rspress/core/runtime';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Scene = 'select' | 'multi' | 'date' | 'touch';

const steps: { scene: Scene; zh: [string, string]; en: [string, string] }[] = [
  {
    scene: 'select',
    zh: [
      '单选，一点即成',
      '视口窄于 576px 时，Select 自动换成底部抽屉：搜索、分组一应俱全，点选即提交并收起。不用写第二套代码。',
    ],
    en: [
      'Single select, one tap',
      'Below 576px, Select becomes a bottom drawer with search and groups. A tap commits and closes. No second code path.',
    ],
  },
  {
    scene: 'multi',
    zh: [
      '多选，先草稿后确认',
      '多选与标签在抽屉里先记草稿，点「完成」才提交，其他方式关闭则取消；旋转屏幕也不丢草稿、搜索和焦点。',
    ],
    en: [
      'Multiple, draft then Done',
      'Multiple and tags selections stay a draft until Done; other closes cancel. Rotation keeps the draft, search and focus.',
    ],
  },
  {
    scene: 'date',
    zh: [
      '日期，拇指可及',
      'DatePicker 同样落到底部抽屉，选择、确认与清空都在拇指范围内，月份与星期标签跟随 locale。',
    ],
    en: [
      'Dates within thumb reach',
      'DatePicker moves to the same bottom drawer. Picking, confirming and clearing stay within thumb reach, labelled by your locale.',
    ],
  },
  {
    scene: 'touch',
    zh: [
      '触控目标 44px',
      '粗指针设备上，按钮、表单控件、复选框标签与清除按钮的点击区域扩到 44px，Switch 保留紧凑外观但预留热区；鼠标下尺寸不变。',
    ],
    en: [
      '44px touch targets',
      'On coarse pointers, buttons, fields, checkbox labels and clear actions target 44px; Switch keeps its compact track with a reserved hit area. Mouse sizes stay put.',
    ],
  },
];

const SCREEN = { width: 390, height: 780 };

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 901px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return wide;
}

function Step({
  index,
  active,
  wide,
  onActive,
}: {
  index: number;
  active: boolean;
  wide: boolean;
  onActive: () => void;
}) {
  const zh = useLang() === 'zh';
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const [title, body] = zh ? steps[index].zh : steps[index].en;
  useEffect(() => {
    if (wide && inView) onActive();
  }, [wide, inView, onActive]);
  return (
    <li ref={ref} className="tao-mobile-step" data-active={active || undefined}>
      <button type="button" aria-pressed={active} onClick={onActive}>
        <span className="tao-mobile-step-index">{`${index + 1} / ${steps.length}`}</span>
        <span className="tao-mobile-step-title">{title}</span>
      </button>
      <motion.p
        initial={false}
        animate={{ opacity: active || wide ? 1 : 0.6 }}
        transition={{ duration: 0.4 }}
      >
        {body}
      </motion.p>
    </li>
  );
}

export function HomeMobile({ seed }: { seed: string }) {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const wide = useWide();
  const reduced = useReducedMotion();
  const [scene, setScene] = useState<Scene>('select');
  const [available, setAvailable] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const visible = useInView(viewport, { amount: 0.3 });
  const iframe = useRef<HTMLIFrameElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 120, damping: 18 });

  const frame = { width: SCREEN.width + 24, height: SCREEN.height + 24 };
  const scale = available
    ? Math.min(1, available / frame.width, 640 / frame.height)
    : 0.8;
  const demoId = zh ? '_zh_index_1' : '_en_index_1';
  const src =
    import.meta.env.DEV && process.env.RSPRESS_IFRAME_DEV_PORT
      ? `http://${window.location.hostname}:${process.env.RSPRESS_IFRAME_DEV_PORT}/${demoId}`
      : withBase(`/~demo/${demoId}`);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(viewport.current!);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const post = () => {
      const target = iframe.current?.contentWindow;
      target?.postMessage({ type: 'theme-change', dark }, '*');
      target?.postMessage(
        { type: 'home-phone', scene: visible ? scene : 'idle', seed },
        '*',
      );
    };
    const ready = (event: MessageEvent) => {
      if (
        event.source === iframe.current?.contentWindow &&
        (event.data?.type === 'home-phone-ready' ||
          event.data?.type === 'tao-demo-ready')
      )
        post();
    };
    window.addEventListener('message', ready);
    post();
    return () => window.removeEventListener('message', ready);
  }, [dark, scene, seed, visible]);

  return (
    <section className="tao-mobile" aria-labelledby="tao-mobile-title">
      <div className="tao-mobile-copy">
        <motion.h2
          id="tao-mobile-title"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {zh
            ? '同一个组件，到手机上换一种手感。'
            : 'Same component. A different feel in the hand.'}
        </motion.h2>
        <ol className="tao-mobile-steps">
          {steps.map((step, index) => (
            <Step
              key={step.scene}
              index={index}
              wide={wide}
              active={scene === step.scene}
              onActive={() => setScene(step.scene)}
            />
          ))}
        </ol>
        {wide ? null : (
          <p className="tao-mobile-active">
            {
              (zh
                ? steps.find((step) => step.scene === scene)?.zh
                : steps.find((step) => step.scene === scene)?.en)?.[1]
            }
          </p>
        )}
      </div>

      <div className="tao-mobile-stage">
        <div
          ref={viewport}
          className="tao-mobile-viewport"
          onPointerMove={(event) => {
            if (reduced) return;
            const box = event.currentTarget.getBoundingClientRect();
            tiltY.set(((event.clientX - box.left) / box.width - 0.5) * 10);
            tiltX.set(((event.clientY - box.top) / box.height - 0.5) * -8);
          }}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
        >
          <motion.div
            className="tao-phone"
            style={{
              width: frame.width,
              height: frame.height,
              scale,
              rotateX,
              rotateY,
              marginBottom: frame.height * (scale - 1),
              marginInline: (frame.width * (scale - 1)) / 2,
            }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <iframe
              ref={iframe}
              src={src}
              title={
                zh
                  ? '手机视口中的真实组件'
                  : 'Real components in a phone viewport'
              }
              loading="lazy"
              style={SCREEN}
            />
          </motion.div>
          <p className="tao-mobile-caption">
            {zh
              ? '真实组件，独立 390px 视口 · 可直接操作'
              : 'Real components in an independent 390px viewport · try it'}
          </p>
        </div>
      </div>
    </section>
  );
}
