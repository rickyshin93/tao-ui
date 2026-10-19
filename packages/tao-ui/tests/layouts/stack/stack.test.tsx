import { afterEach, expect, test } from '@rstest/core';
import { render, waitFor } from '@testing-library/react';
import { Stack } from '../../../src/layouts/stack/stack';
import { restoreViewport, setViewportWidth } from '../../utils/mock-viewport';

afterEach(() => {
  restoreViewport();
});

test('direction=vertical sets data-tao-direction', () => {
  const { container } = render(
    <Stack direction="vertical">
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  expect(el.dataset.taoDirection).toBe('vertical');
});

test('direction defaults to vertical', () => {
  const { container } = render(
    <Stack>
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  expect(el.dataset.taoDirection).toBe('vertical');
});

test('direction=horizontal sets data-tao-direction', () => {
  const { container } = render(
    <Stack direction="horizontal">
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  expect(el.dataset.taoDirection).toBe('horizontal');
});

test('gap prop sets data-tao-gap', () => {
  const { container } = render(
    <Stack gap="lg">
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  expect(el.dataset.taoGap).toBe('lg');
});

test('applies semantic root class and style', () => {
  const { container } = render(
    <Stack
      className="consumer"
      style={{ width: 320 }}
      classNames={{ root: 'semantic-root' }}
      styles={{ root: { maxWidth: 640 } }}
    >
      content
    </Stack>,
  );
  const root = container.querySelector('[data-tao-stack]') as HTMLElement;
  expect(root).toHaveClass('consumer', 'semantic-root');
  expect(root).toHaveStyle({ width: '320px', maxWidth: '640px' });
});

test('responsive direction resolves against the current breakpoint', async () => {
  setViewportWidth(1024);
  const { container } = render(
    <Stack direction={{ xs: 'vertical', md: 'horizontal' }}>
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  await waitFor(() => expect(el.dataset.taoDirection).toBe('horizontal'));
});

test('responsive direction falls back to default when no entry matches', async () => {
  setViewportWidth(700);
  const { container } = render(
    <Stack direction={{ md: 'horizontal' }}>
      <div>a</div>
    </Stack>,
  );
  const el = container.querySelector('[data-tao-stack]')! as HTMLElement;
  // 700px matches sm only; the md entry does not apply and no xs/base value
  // exists, so the vertical default holds even after hydration.
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(el.dataset.taoDirection).toBe('vertical');
});
