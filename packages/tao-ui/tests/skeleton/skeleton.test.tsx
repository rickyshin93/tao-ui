import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import {
  Skeleton,
  type SkeletonRef,
} from '../../src/components/skeleton/skeleton';
import { TaoProvider } from '../../src/provider/tao-provider';

test('defaults to three paragraph rows and replaces children until loaded', () => {
  const { container, rerender } = render(<Skeleton>Loaded record</Skeleton>);
  expect(screen.queryByText('Loaded record')).toBeNull();
  expect(container.querySelectorAll('[data-tao-kind="paragraph"]').length).toBe(
    3,
  );
  expect(
    (container.querySelector('[data-tao-kind="title"]') as HTMLElement).style
      .width,
  ).toBe('38%');
  rerender(<Skeleton loading={false}>Loaded record</Skeleton>);
  expect(screen.getByText('Loaded record')).toBeTruthy();
  expect(container.querySelector('[data-tao-skeleton]')).toBeNull();
});

test('explicit loading undefined follows the upstream loaded-content behavior', () => {
  render(<Skeleton loading={undefined}>Ready</Skeleton>);
  expect(screen.getByText('Ready')).toBeTruthy();
});

test('native ref becomes null when skeleton gives way to children', () => {
  const ref = createRef<SkeletonRef>();
  const { container, rerender } = render(<Skeleton ref={ref} loading />);
  expect(ref.current?.nativeElement).toBe(container.firstElementChild);
  rerender(
    <Skeleton ref={ref} loading={false}>
      Ready
    </Skeleton>,
  );
  expect(ref.current?.nativeElement).toBeNull();
});

test('avatar with paragraph adjusts defaults and title-only avatar is square', () => {
  const { container, rerender } = render(<Skeleton avatar />);
  expect(container.querySelectorAll('[data-tao-kind="paragraph"]').length).toBe(
    2,
  );
  expect(
    (container.querySelector('[data-tao-kind="title"]') as HTMLElement).style
      .width,
  ).toBe('50%');
  expect(
    container
      .querySelector('[data-tao-kind="avatar"]')
      ?.getAttribute('data-tao-shape'),
  ).toBe('circle');
  rerender(<Skeleton avatar paragraph={false} />);
  expect(
    container
      .querySelector('[data-tao-kind="avatar"]')
      ?.getAttribute('data-tao-shape'),
  ).toBe('square');
  expect(container.querySelector('[data-tao-skeleton-paragraph]')).toBeNull();
});

test('paragraph widths apply per row or to just the last row', () => {
  const { container, rerender } = render(
    <Skeleton
      title={false}
      paragraph={{ rows: 3, width: [100, '80%', '40%'] }}
    />,
  );
  const rows = [
    ...container.querySelectorAll<HTMLElement>('[data-tao-kind="paragraph"]'),
  ];
  expect(rows.map((row) => row.style.width)).toEqual(['100px', '80%', '40%']);
  rerender(<Skeleton paragraph={{ rows: 2, width: 120 }} />);
  const changedRows = [
    ...container.querySelectorAll<HTMLElement>('[data-tao-kind="paragraph"]'),
  ];
  expect(changedRows.map((row) => row.style.width)).toEqual(['', '120px']);
});

test('supports zero paragraph rows and explicitly disabled sections', () => {
  const { container, rerender } = render(
    <Skeleton title={false} paragraph={{ rows: 0 }} />,
  );
  expect(container.querySelectorAll('[data-tao-kind="paragraph"]').length).toBe(
    0,
  );
  rerender(<Skeleton title={false} paragraph={false} avatar />);
  expect(container.querySelector('[data-tao-skeleton-section]')).toBeNull();
  expect(container.querySelector('[data-tao-kind="avatar"]')).toBeTruthy();
});

test('main semantic callbacks receive defaults and custom avatar/title widths apply', () => {
  const { container } = render(
    <Skeleton
      avatar={{ size: 48 }}
      title={{ width: '70%', className: 'title-setting' }}
      round
      active
      classNames={({ props }) => ({
        root: props.paragraph === true ? 'paragraph-default' : '',
        title: 'title-slot',
      })}
      styles={{ title: { height: 20 }, header: { padding: 4 } }}
    />,
  );
  expect(container.firstElementChild?.className).toContain('paragraph-default');
  const title = container.querySelector<HTMLElement>('[data-tao-kind="title"]');
  expect(title?.className).toContain('title-setting');
  expect(title?.className).toContain('title-slot');
  expect(title?.style.width).toBe('70%');
  expect(title?.style.height).toBe('20px');
  expect(
    container.querySelector<HTMLElement>('[data-tao-kind="avatar"]')?.style
      .width,
  ).toBe('48px');
});

test('standalone placeholders inherit provider size and honor direct overrides', () => {
  const { container } = render(
    <TaoProvider size="small">
      <Skeleton.Button />
      <Skeleton.Input size="large" />
      <Skeleton.Avatar size={44} />
    </TaoProvider>,
  );
  expect(
    container
      .querySelector('[data-tao-kind="button"]')
      ?.getAttribute('data-tao-size'),
  ).toBe('small');
  expect(
    container
      .querySelector('[data-tao-kind="input"]')
      ?.getAttribute('data-tao-size'),
  ).toBe('large');
  expect(
    container.querySelector<HTMLElement>('[data-tao-kind="avatar"]')?.style
      .width,
  ).toBe('44px');
});

test('compound avatar applies its own root and content semantic slots', () => {
  const { container } = render(
    <Skeleton
      avatar={{
        classNames: { root: 'avatar-container', content: 'avatar-shape' },
        styles: { root: { margin: 8 }, content: { width: 54, height: 54 } },
      }}
    />,
  );
  const header = container.querySelector('[data-tao-skeleton-header]');
  const avatar = container.querySelector('[data-tao-kind="avatar"]');
  expect(header).toHaveClass('avatar-container');
  expect(header).toHaveStyle({ margin: '8px' });
  expect(avatar).toHaveClass('avatar-shape');
  expect(avatar).toHaveStyle({ width: '54px', height: '54px' });
});

test('standalone semantic root and content styles stay independently configurable', () => {
  const { container } = render(
    <Skeleton.Button
      block
      shape="round"
      active
      styles={{ root: { margin: 8 }, content: { width: 100 } }}
      style={{ width: 140 }}
      classNames={{ root: 'root-slot', content: 'content-slot' }}
    />,
  );
  expect((container.firstElementChild as HTMLElement).style.margin).toBe('8px');
  expect(container.firstElementChild?.hasAttribute('data-tao-block')).toBe(
    true,
  );
  const content = container.querySelector<HTMLElement>(
    '[data-tao-kind="button"]',
  );
  expect(content?.style.width).toBe('140px');
  expect(content?.getAttribute('data-tao-shape')).toBe('round');
});

test('Image and Node supply non-interactive visual placeholders', () => {
  const { container } = render(
    <>
      <Skeleton.Image />
      <Skeleton.Node style={{ width: 200 }}>Custom preview</Skeleton.Node>
    </>,
  );
  expect(container.querySelector('[data-tao-kind="image"] svg')).toBeTruthy();
  expect(screen.getByText('Custom preview').style.width).toBe('200px');
  expect(
    container.querySelectorAll('[aria-hidden="true"]').length,
  ).toBeGreaterThanOrEqual(2);
});
