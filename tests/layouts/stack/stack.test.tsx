import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { Stack } from '../../../src/layouts/stack/stack';

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
