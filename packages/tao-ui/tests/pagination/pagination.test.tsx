import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination } from '../../src/components/pagination/pagination';
import { TaoProvider, zhCN } from '../../src/provider/tao-provider';

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

test('selecting the current page does not emit a redundant change', () => {
  const onChange = rs.fn();
  render(<Pagination total={50} defaultCurrent={2} onChange={onChange} />);
  fireEvent.click(screen.getByLabelText('Page 2'));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText('Page 3'));
  fireEvent.click(screen.getByLabelText('Page 3'));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(3, 10);
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

test('uncontrolled current is clamped when total shrinks and stays there when total grows', () => {
  const { rerender } = render(<Pagination total={21} defaultCurrent={3} />);
  rerender(<Pagination total={11} defaultCurrent={3} />);
  expect(screen.getByLabelText('Page 2')).toHaveAttribute(
    'aria-current',
    'page',
  );
  rerender(<Pagination total={21} defaultCurrent={3} />);
  expect(screen.getByLabelText('Page 2')).toHaveAttribute(
    'aria-current',
    'page',
  );
  rerender(<Pagination total={0} defaultCurrent={3} />);
  expect(screen.getByLabelText('Page 1')).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('uncontrolled current is clamped when controlled page size increases', () => {
  const { rerender } = render(
    <Pagination total={30} defaultCurrent={3} pageSize={10} />,
  );
  rerender(<Pagination total={30} defaultCurrent={3} pageSize={20} />);
  expect(screen.getByLabelText('Page 2')).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('controlled current remains parent-owned after total changes', () => {
  const { rerender } = render(<Pagination total={21} current={3} />);
  rerender(<Pagination total={11} current={3} />);
  expect(document.querySelector('[aria-current="page"]')).toBeNull();
  rerender(<Pagination total={21} current={3} />);
  expect(screen.getByLabelText('Page 3')).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('size changer shows the active size even when it is absent from the options', () => {
  const view = render(
    <Pagination
      total={100}
      pageSize={15}
      pageSizeOptions={[10, 20]}
      showSizeChanger
    />,
  );
  expect(screen.getByRole('combobox')).toHaveTextContent('15 / page');

  view.rerender(
    <Pagination
      total={100}
      pageSize={20}
      pageSizeOptions={[10, 20]}
      showSizeChanger
    />,
  );
  expect(screen.getByRole('combobox')).toHaveTextContent('20 / page');
});

test('labels the page-size control in the current locale', () => {
  render(
    <TaoProvider locale={zhCN}>
      <Pagination total={100} showSizeChanger />
    </TaoProvider>,
  );
  expect(screen.getByRole('combobox', { name: '每页条数' })).toHaveTextContent(
    '10 条/页',
  );
});

test('shows an empty range while the requested controlled page has no data', () => {
  const view = render(
    <Pagination
      current={3}
      total={30}
      showTotal={(_, range) => range.join('–')}
    />,
  );
  expect(screen.getByText('21–30')).toBeInTheDocument();
  view.rerender(
    <Pagination
      current={3}
      total={11}
      showTotal={(_, range) => range.join('–')}
    />,
  );
  expect(screen.getByText('0–0')).toBeInTheDocument();
});
