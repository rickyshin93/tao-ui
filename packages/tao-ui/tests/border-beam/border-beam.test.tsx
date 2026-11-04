import { afterEach, expect, rstest, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { BorderBeam } from '../../src/components/border-beam/border-beam';
import { Card } from '../../src/components/card/card';

afterEach(() => rstest.restoreAllMocks());
test('portals beams into a native child while preserving its ref and layout styles', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <BorderBeam count={2} lineWidth={2} size={60}>
      <div ref={ref} style={{ position: 'static' }}>
        <span>Host</span>
      </div>
    </BorderBeam>,
  );
  const host = ref.current!;
  expect(host).toHaveStyle({ position: 'relative' });
  expect(host.querySelectorAll('[data-tao-border-beam]')).toHaveLength(2);
  expect(host.querySelector('[data-tao-border-beam]')).toHaveStyle({
    padding: '2px',
  });
  expect(host.querySelector('[data-tao-border-beam-light]')).toHaveStyle({
    width: '60px',
  });
  rerender(<div ref={ref}>Next</div>);
  expect(host.style.position).toBe('static');
});
test('supports component refs and item overrides take precedence over count', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <BorderBeam
      count={7}
      size={100}
      items={[{ color: 'red', size: '50%', outset: 3 }, { lineWidth: 4 }]}
      classNames={{ beam: 'light' }}
    >
      <Card ref={ref}>Card</Card>
    </BorderBeam>,
  );
  const beams = ref.current!.querySelectorAll<HTMLElement>(
    '[data-tao-border-beam]',
  );
  expect(beams).toHaveLength(2);
  expect(beams[0]).toHaveStyle({ inset: '-3px' });
  expect(beams[0].querySelector('span')).toHaveStyle({ width: '50%' });
  expect(beams[1]).toHaveStyle({ padding: '4px' });
  expect(beams[1].querySelector('span')).toHaveClass('light');
});
test('animates transforms and cancels its scheduled frame during cleanup', () => {
  const frames: FrameRequestCallback[] = [];
  rstest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
  const cancel = rstest.spyOn(globalThis, 'cancelAnimationFrame');
  const { container, unmount } = render(
    <BorderBeam>
      <div>
        <span>Animated</span>
      </div>
    </BorderBeam>,
  );
  act(() => frames[0](10));
  expect(
    container.querySelector<HTMLElement>('[data-tao-border-beam-light]')?.style
      .transform,
  ).toContain('translate');
  unmount();
  expect(cancel).toHaveBeenCalledWith(2);
});
test('empty items and text children preserve their content without creating effects', () => {
  const { container, rerender } = render(
    <BorderBeam items={[]}>
      <div>No effects</div>
    </BorderBeam>,
  );
  expect(screen.getByText('No effects')).toBeTruthy();
  expect(container.querySelector('[data-tao-border-beam]')).toBeNull();
  rerender(<BorderBeam>Text</BorderBeam>);
  expect(screen.getByText('Text')).toBeTruthy();
  expect(container.querySelector('[data-tao-border-beam]')).toBeNull();
});
