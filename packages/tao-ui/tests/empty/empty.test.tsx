import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Empty, type EmptyRef } from '../../src/components/empty/empty';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

test('renders the built-in image and localized empty description', () => {
  const { rerender } = render(<Empty />);
  expect(screen.getByText('No data')).toBeTruthy();
  rerender(
    <TaoProvider locale={zhCN}>
      <Empty />
    </TaoProvider>,
  );
  expect(screen.getByText('暂无数据')).toBeTruthy();
});

test('image URL uses the description as alternative text', () => {
  render(<Empty image="/archive.svg" description="No archived files" />);
  expect(
    screen.getByRole('img', { name: 'No archived files' }).getAttribute('src'),
  ).toBe('/archive.svg');
});

test('null description hides the description and false image removes the artwork', () => {
  const { container } = render(<Empty image={false} description={null} />);
  expect(container.querySelector('[data-tao-empty-description]')).toBeNull();
  expect(container.querySelector('svg')).toBeNull();
});

test('renders numeric content and interactive footer without swallowing clicks', () => {
  let clicks = 0;
  render(
    <Empty description={0}>
      <button
        type="button"
        onClick={() => {
          clicks += 1;
        }}
      >
        Create record
      </button>
    </Empty>,
  );
  expect(screen.getByText('0')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Create record' }));
  expect(clicks).toBe(1);
});

test('supports simple built-in image, root ref and prefix classes', () => {
  const ref = createRef<EmptyRef>();
  const { container } = render(
    <Empty
      ref={ref}
      prefixCls="custom-empty"
      rootClassName="extra-root"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />,
  );
  expect(ref.current?.nativeElement).toBe(container.firstElementChild);
  expect(ref.current?.nativeElement.classList.contains('custom-empty')).toBe(
    true,
  );
  expect(ref.current?.nativeElement.hasAttribute('data-tao-simple')).toBe(true);
  expect(container.querySelector('.custom-empty-image')).toBeTruthy();
});

test('semantic callbacks receive props and root style overrides semantic root', () => {
  const { container } = render(
    <Empty
      description="Empty inbox"
      imageStyle={{ height: 40 }}
      style={{ padding: 12 }}
      classNames={({ props }) => ({
        description:
          props.description === 'Empty inbox' ? 'empty-copy' : undefined,
      })}
      styles={() => ({
        root: { padding: 20 },
        image: { height: 32 },
        description: { color: 'red' },
      })}
    />,
  );
  expect(screen.getByText('Empty inbox').className).toContain('empty-copy');
  expect((container.firstElementChild as HTMLElement).style.padding).toBe(
    '12px',
  );
  expect(
    (container.querySelector('[data-tao-empty-image]') as HTMLElement).style
      .height,
  ).toBe('32px');
});
