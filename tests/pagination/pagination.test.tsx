import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from '../../src/components/pagination/pagination';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders correct page buttons for small total', () => {
  render(<Pagination total={50} />);
  // 50 / 10 = 5 pages
  for (let i = 1; i <= 5; i++) {
    expect(screen.getByLabelText(`Page ${i}`)).toBeTruthy();
  }
});

test('page 1 active by default', () => {
  render(<Pagination total={50} />);
  const btn = screen.getByLabelText('Page 1');
  expect(btn.dataset.taoActive).toBeTruthy();
});

test('defaultCurrent sets initial page', () => {
  render(<Pagination total={100} defaultCurrent={3} />);
  const btn = screen.getByLabelText('Page 3');
  expect(btn.dataset.taoActive).toBeTruthy();
});

test('controlled current', () => {
  const { rerender } = render(<Pagination total={100} current={2} />);
  expect(screen.getByLabelText('Page 2').dataset.taoActive).toBeTruthy();
  rerender(<Pagination total={100} current={5} />);
  expect(screen.getByLabelText('Page 5').dataset.taoActive).toBeTruthy();
});

test('onChange fires on page click', () => {
  let page = 0;
  render(
    <Pagination
      total={50}
      onChange={(p) => {
        page = p;
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText('Page 3'));
  expect(page).toBe(3);
});

test('prev button disabled on first page', () => {
  render(<Pagination total={50} />);
  expect(screen.getByLabelText('Previous page')).toBeDisabled();
});

test('next button disabled on last page', () => {
  render(<Pagination total={50} current={5} />);
  expect(screen.getByLabelText('Next page')).toBeDisabled();
});

test('prev/next navigation works', () => {
  let page = 0;
  render(
    <Pagination
      total={50}
      defaultCurrent={3}
      onChange={(p) => {
        page = p;
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText('Next page'));
  expect(page).toBe(4);
  fireEvent.click(screen.getByLabelText('Previous page'));
  // Internal state went to 4, now back to 3
  expect(page).toBe(3);
});

test('shows ellipsis for large page count', () => {
  render(<Pagination total={200} current={1} />);
  // 200/10 = 20 pages -> should have ellipsis
  expect(screen.getByText('···')).toBeTruthy();
});

test('showTotal renders total info', () => {
  render(
    <Pagination
      total={95}
      current={2}
      pageSize={10}
      showTotal={(t, [s, e]) => `${s}-${e} of ${t}`}
    />,
  );
  expect(screen.getByText('11-20 of 95')).toBeTruthy();
});

test('showSizeChanger renders select', () => {
  render(<Pagination total={100} showSizeChanger onChange={() => {}} />);
  const select = screen.getByRole('combobox');
  expect(select).toBeTruthy();
  // Default value should be "10 / page"
  expect(screen.getByText('10 / page')).toBeTruthy();
});

test('inherits size from TaoProvider', () => {
  render(
    <TaoProvider size="large">
      <Pagination total={50} />
    </TaoProvider>,
  );
  const nav = screen.getByRole('navigation');
  expect((nav as HTMLElement).dataset.taoSize).toBe('large');
});
