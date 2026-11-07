import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Progress } from '../../src/components/progress/progress';
import { TaoProvider } from '../../src/provider/tao-provider';

test('percent is clamped consistently for accessible value and text', () => {
  const { rerender } = render(
    <Progress percent={120} status="normal" aria-label="Download" />,
  );
  expect(
    screen
      .getByRole('progressbar', { name: 'Download' })
      .getAttribute('aria-valuenow'),
  ).toBe('100');
  expect(screen.getByText('100%')).toBeTruthy();
  rerender(<Progress percent={-10} />);
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
    '0',
  );
  expect(screen.getByText('0%')).toBeTruthy();
});

test('native ref and aria-labelledby identify the progressbar', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <>
      <span id="upload-label">Uploading files</span>
      <Progress ref={ref} percent={75} aria-labelledby="upload-label" />
    </>,
  );
  expect(ref.current).toBe(
    screen.getByRole('progressbar', { name: 'Uploading files' }),
  );
  expect(ref.current?.getAttribute('aria-valuemin')).toBe('0');
  expect(ref.current?.getAttribute('aria-valuemax')).toBe('100');
});

test('completion status follows explicit status and success percent', () => {
  const { rerender } = render(<Progress percent={100} />);
  expect(screen.getByRole('progressbar').getAttribute('data-tao-status')).toBe(
    'success',
  );
  rerender(<Progress percent={100} success={{ percent: 50 }} />);
  expect(screen.getByRole('progressbar').getAttribute('data-tao-status')).toBe(
    'normal',
  );
  rerender(<Progress percent={100} status="exception" />);
  expect(screen.getByRole('progressbar').getAttribute('data-tao-status')).toBe(
    'exception',
  );
});

test('format receives main and success percent, while showInfo suppresses output', () => {
  const { rerender } = render(
    <Progress
      percent={65}
      success={{ percent: 30 }}
      format={(percent, success) => `${success} verified / ${percent} total`}
    />,
  );
  expect(screen.getByText('30 verified / 65 total')).toBeTruthy();
  rerender(
    <Progress percent={65} showInfo={false} format={() => 'Hidden label'} />,
  );
  expect(screen.queryByText('Hidden label')).toBeNull();
});

test('line success is a separate overlay and does not change aria value', () => {
  const { container } = render(
    <Progress
      percent={60}
      success={{ percent: 25, strokeColor: 'green' }}
      strokeColor="red"
    />,
  );
  const tracks = container.querySelectorAll<HTMLElement>(
    '[data-tao-progress-track]',
  );
  expect(tracks[0].style.width).toBe('60%');
  expect(tracks[0].style.background).toBe('red');
  expect(tracks[1].style.width).toBe('25%');
  expect(tracks[1].style.background).toBe('green');
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
    '60',
  );
});

test('line size supports numeric, tuple percentage width and object dimensions', () => {
  const { container, rerender } = render(<Progress size={24} />);
  const body = () =>
    container.querySelector<HTMLElement>('[data-tao-progress-body]');
  const rail = () =>
    container.querySelector<HTMLElement>('[data-tao-progress-rail]');
  expect(body()?.style.width).toBe('24px');
  expect(rail()?.style.height).toBe('24px');
  rerender(<Progress size={['50%', 12]} />);
  expect(body()?.style.width).toBe('50%');
  expect(rail()?.style.height).toBe('12px');
  rerender(<Progress size={{ width: 200, height: 16 }} />);
  expect(body()?.style.width).toBe('200px');
  expect(rail()?.style.height).toBe('16px');
});

test('provider small size and legacy rail/width props are honored', () => {
  const { container, rerender } = render(
    <TaoProvider size="small">
      <Progress trailColor="gray" />
    </TaoProvider>,
  );
  const rail = container.querySelector<HTMLElement>('[data-tao-progress-rail]');
  expect(rail?.style.height).toBe('6px');
  expect(rail?.style.background).toBe('gray');
  rerender(<Progress type="circle" width={80} />);
  expect(
    container.querySelector<HTMLElement>('[data-tao-progress-body]')?.style
      .width,
  ).toBe('80px');
});

test('line gradients sort stops and support from/to directions', () => {
  const { container, rerender } = render(
    <Progress
      percent={50}
      strokeColor={{ '100%': 'blue', '0%': 'red', '50%': 'green' }}
    />,
  );
  expect(
    container.querySelector<HTMLElement>('[data-tao-progress-track]')?.style
      .background,
  ).toBe('linear-gradient(to right, red 0%, green 50%, blue 100%)');
  rerender(
    <Progress
      percent={50}
      strokeColor={{ from: 'red', to: 'blue', direction: 'to left' }}
    />,
  );
  expect(
    container.querySelector<HTMLElement>('[data-tao-progress-track]')?.style
      .background,
  ).toBe('linear-gradient(to left, red 0%, blue 100%)');
});

test('line steps use custom rounding, per-step colors and individual sizes', () => {
  const { container, rerender } = render(
    <Progress
      percent={39}
      steps={5}
      rounding={Math.floor}
      size={[10, 18]}
      strokeColor={['red', 'orange', 'yellow', 'green', 'blue']}
      railColor="gray"
    />,
  );
  expect(
    container.querySelectorAll('[data-tao-progress-step][data-tao-active]')
      .length,
  ).toBe(1);
  const steps = container.querySelectorAll<HTMLElement>(
    '[data-tao-progress-step]',
  );
  expect(steps[0].style.background).toBe('red');
  expect(steps[0].style.width).toBe('10px');
  expect(steps[0].style.height).toBe('18px');
  expect(steps[1].style.background).toBe('gray');
  rerender(<Progress percent={39} steps={5} />);
  expect(
    container.querySelectorAll('[data-tao-progress-step][data-tao-active]')
      .length,
  ).toBe(2);
});

test('inner indicator remains numeric on completion and is inside the rail', () => {
  const { container } = render(
    <Progress
      percent={100}
      percentPosition={{ type: 'inner', align: 'center' }}
    />,
  );
  expect(
    screen.getByText('100%').closest('[data-tao-progress-rail]'),
  ).toBeTruthy();
  expect(container.firstElementChild?.getAttribute('data-tao-info-align')).toBe(
    'center',
  );
});

test('circle uses independent success arc, custom colors and semantic overrides', () => {
  const { container } = render(
    <Progress
      type="circle"
      percent={70}
      success={{ percent: 20, strokeColor: 'green' }}
      strokeColor="red"
      railColor="gray"
      strokeWidth={8}
      strokeLinecap="square"
    />,
  );
  const paths = container.querySelectorAll<SVGElement>(
    '[data-tao-progress-track]',
  );
  expect(paths[0].getAttribute('stroke-dasharray')).toBe('70 100');
  expect(paths[0].style.stroke).toBe('red');
  expect(paths[0].getAttribute('stroke-width')).toBe('8');
  expect(paths[0].getAttribute('stroke-linecap')).toBe('square');
  expect(paths[1].getAttribute('stroke-dasharray')).toBe('20 100');
  expect(paths[1].style.stroke).toBe('green');
  expect(
    container.querySelector<SVGElement>('[data-tao-progress-rail]')?.style
      .stroke,
  ).toBe('gray');
});

test('SVG gradients use unique ids and real color stops', () => {
  const { container } = render(
    <>
      <Progress
        type="circle"
        percent={40}
        strokeColor={{ '0%': 'red', '100%': 'blue' }}
      />
      <Progress
        type="circle"
        percent={50}
        strokeColor={{ from: 'green', to: 'blue' }}
      />
    </>,
  );
  const gradients = [...container.querySelectorAll('linearGradient')];
  expect(gradients.length).toBe(2);
  expect(gradients[0].id).not.toBe(gradients[1].id);
  expect(gradients[0].querySelector('stop')?.getAttribute('stop-color')).toBe(
    'red',
  );
  expect(
    container.querySelector<SVGElement>('[data-tao-progress-track]')?.style
      .stroke,
  ).toBe(`url(#${gradients[0].id})`);
});

test('dashboard supports zero gap and clamps the maximum gap to 295 degrees', () => {
  const { container, rerender } = render(
    <Progress type="dashboard" percent={50} gapDegree={0} />,
  );
  const path = () =>
    container.querySelector('[data-tao-progress-rail]')?.getAttribute('d');
  const fullCircle = path();
  expect(fullCircle?.match(/ A /g)?.length).toBe(2);
  rerender(<Progress type="dashboard" percent={50} gapDegree={295} />);
  const maximum = path();
  expect(maximum?.match(/ A /g)?.length).toBe(1);
  rerender(<Progress type="dashboard" percent={50} gapDegree={300} />);
  expect(path()).toBe(maximum);
});

test('logical and physical gap placements alter dashboard geometry', () => {
  const { container, rerender } = render(
    <Progress type="dashboard" gapPlacement="start" />,
  );
  const body = container.querySelector('[data-tao-progress-body]');
  const start = container
    .querySelector('[data-tao-progress-rail]')
    ?.getAttribute('d');
  expect(body?.getAttribute('data-tao-gap-placement')).toBe('start');
  rerender(<Progress type="dashboard" gapPosition="right" />);
  expect(
    container.querySelector('[data-tao-progress-rail]')?.getAttribute('d'),
  ).not.toBe(start);
});

test('dashboard logical gaps follow RTL while physical gaps stay fixed', () => {
  const { container } = render(
    <div style={{ direction: 'rtl' }}>
      <Progress type="dashboard" gapPlacement="start" />
      <Progress type="dashboard" gapPlacement="end" />
      <Progress type="dashboard" gapPosition="left" />
      <Progress type="dashboard" gapPosition="right" />
    </div>,
  );
  const [start, end, left, right] = Array.from(
    container.querySelectorAll('[data-tao-progress-rail]'),
    (rail) => rail.getAttribute('d'),
  );
  expect(start).toBe(right);
  expect(end).toBe(left);
  expect(left).not.toBe(right);
});

test('circle steps use the individual stroke colors of completed segments', () => {
  const { container } = render(
    <Progress
      type="circle"
      percent={75}
      steps={4}
      strokeColor={['red', 'green', 'blue']}
      railColor="gray"
    />,
  );
  const segments = container.querySelectorAll<SVGPathElement>(
    '[data-tao-progress-step]',
  );
  expect(Array.from(segments, (segment) => segment.style.stroke)).toEqual([
    'red',
    'green',
    'blue',
    'gray',
  ]);
});

test('the small circle tooltip formats percent with the provider locale', async () => {
  const { container } = render(
    <TaoProvider locale={{ numberLocale: 'fr-FR' }}>
      <Progress type="circle" size={20} percent={12.5} />
    </TaoProvider>,
  );
  fireEvent.focus(container.querySelector('[data-tao-progress-body]')!);
  const text = new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(0.125);
  expect((await screen.findByRole('tooltip')).textContent).toBe(text);
});

test('a very small circle keeps a positive SVG arc radius', () => {
  const { container } = render(
    <Progress type="circle" size={2} percent={50} />,
  );
  const path = container.querySelector('[data-tao-progress-rail]')!;
  const radius = Number(path.getAttribute('d')?.match(/ A ([^ ]+)/)?.[1]);
  expect(radius).toBeGreaterThan(0);
});

test('circle steps render the requested count, gap and active segments', () => {
  const { container, rerender } = render(
    <Progress
      type="circle"
      steps={{ count: 10, gap: 4 }}
      percent={50}
      strokeColor="red"
      railColor="gray"
    />,
  );
  expect(container.querySelectorAll('[data-tao-progress-step]').length).toBe(
    10,
  );
  expect(
    container.querySelectorAll('[data-tao-progress-step][data-tao-active]')
      .length,
  ).toBe(5);
  const path = container
    .querySelector('[data-tao-progress-step]')
    ?.getAttribute('d');
  rerender(
    <Progress type="circle" steps={{ count: 10, gap: 0 }} percent={50} />,
  );
  expect(
    container.querySelector('[data-tao-progress-step]')?.getAttribute('d'),
  ).not.toBe(path);
});

test('semantic functions receive resolved values and style overrides reach parts', () => {
  const { container } = render(
    <Progress
      percent={40}
      prefixCls="custom-progress"
      classNames={({ props }) => ({
        root: `kind-${props.type}`,
        body: 'custom-body',
        track: 'custom-track',
      })}
      styles={{
        root: { margin: 4 },
        rail: { height: 24 },
        track: { background: 'purple' },
        indicator: { color: 'black' },
      }}
      style={{ margin: 8 }}
    />,
  );
  expect(container.firstElementChild?.className).toContain('kind-line');
  expect((container.firstElementChild as HTMLElement).style.margin).toBe('8px');
  expect(
    container.querySelector<HTMLElement>('[data-tao-progress-track]')?.style
      .background,
  ).toBe('purple');
  expect(
    container.querySelector('.custom-progress-body.custom-body'),
  ).toBeTruthy();
});

test.each(['line', 'circle', 'dashboard'] as const)(
  '%s stepped progress counts the success portion inside the overall value',
  (type) => {
    const { container } = render(
      <Progress
        type={type}
        percent={80}
        success={{ percent: 30, strokeColor: 'green' }}
        steps={10}
        strokeColor="red"
        railColor="gray"
      />,
    );
    const steps = [
      ...container.querySelectorAll<HTMLElement | SVGElement>(
        '[data-tao-progress-step]',
      ),
    ];
    expect(
      steps.filter((step) => step.hasAttribute('data-tao-active')),
    ).toHaveLength(8);
    expect(
      steps.filter((step) => step.hasAttribute('data-tao-success')),
    ).toEqual(steps.slice(0, 3));
    const property = type === 'line' ? 'background' : 'stroke';
    expect(steps[0].style[property]).toBe('green');
    expect(steps[3].style[property]).toBe('red');
    expect(steps[8].style[property]).toBe('gray');
  },
);

test('localizes the default percentage without changing the underlying numeric value', () => {
  render(
    <TaoProvider locale={{ numberLocale: 'ar-EG' }}>
      <Progress percent={33.3} aria-label="Upload" />
    </TaoProvider>,
  );
  const formatted = new Intl.NumberFormat('ar-EG', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(0.333);
  expect(screen.getByText(formatted)).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
    'aria-valuenow',
    '33.3',
  );
});
