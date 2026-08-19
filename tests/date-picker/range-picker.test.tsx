import { readFileSync } from 'node:fs';
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import dayjs from 'dayjs';
import { RangePicker } from '../../src/components/date-picker/range-picker';

test('renders with placeholder', () => {
  render(<RangePicker mobile={false} />);
  const inputs = screen.getAllByRole('textbox');
  expect(inputs[0]).toHaveAttribute('placeholder', 'Start date');
  expect(inputs[1]).toHaveAttribute('placeholder', 'End date');
});

test('displays formatted range values', () => {
  render(
    <RangePicker
      mobile={false}
      value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
    />,
  );
  const inputs = screen.getAllByRole('textbox');
  expect(inputs[0]).toHaveValue('2026-06-01');
  expect(inputs[1]).toHaveValue('2026-06-15');
});

test('shows separator', () => {
  render(<RangePicker separator="→" />);
  expect(screen.getByText('→')).toBeTruthy();
});

test('range content aligns to the start without excess leading space', () => {
  const css = readFileSync(
    'src/components/date-picker/date-picker.css',
    'utf8',
  );
  const rule = css.match(/\[data-tao-range-input\] \{([^}]+)\}/)?.[1];

  expect(rule).toContain('text-align: start;');
});

test('click opens dual calendar panels', async () => {
  render(<RangePicker mobile={false} />);
  await userEvent.click(screen.getAllByRole('textbox')[0]);
  // Should have 2 calendar grids
  const grids = screen.getAllByRole('grid');
  expect(grids.length).toBe(2);
});

test('closing cancels an unfinished calendar range selection', async () => {
  let changeCount = 0;
  const view = render(
    <RangePicker
      mobile={false}
      open
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-18' })[0],
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open={false}
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open
      defaultValue={[dayjs('2026-06-15'), null]}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );
  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-20' })[0],
  );

  expect(changeCount).toBe(0);
});

test('external value updates cancel an unfinished range selection', async () => {
  let changeCount = 0;
  const onChange = () => {
    changeCount += 1;
  };
  const view = render(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-06-01'), dayjs('2026-06-10')]}
      onChange={onChange}
    />,
  );

  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-06-18' })[0],
  );
  view.rerender(
    <RangePicker
      mobile={false}
      open
      value={[dayjs('2026-07-01'), dayjs('2026-07-10')]}
      onChange={onChange}
    />,
  );
  await userEvent.click(
    screen.getAllByRole('button', { name: '2026-07-20' })[0],
  );

  expect(changeCount).toBe(0);
});

test('PC inputs accept a typed range with strict formatting', async () => {
  let result: [string, string] = ['', ''];
  render(
    <RangePicker
      mobile={false}
      value={[null, dayjs('2026-07-31')]}
      onChange={(_, dateStrings) => {
        result = dateStrings;
      }}
    />,
  );

  await userEvent.type(screen.getAllByRole('textbox')[0], '2026-07-01{Enter}');

  expect(result).toEqual(['2026-07-01', '2026-07-31']);
});

test('PC inputs reject invalid dates', async () => {
  let changeCount = 0;
  render(
    <RangePicker
      mobile={false}
      onChange={() => {
        changeCount += 1;
      }}
    />,
  );

  const input = screen.getAllByRole('textbox')[0];
  await userEvent.type(input, '2026-02-31{Enter}');

  expect(changeCount).toBe(0);
  expect(input).toHaveValue('');
});

test('mobile trigger remains a button', () => {
  render(<RangePicker mobile />);
  expect(screen.getByRole('button')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
});

test('clear button resets range', async () => {
  let cleared = false;
  const { container } = render(
    <RangePicker
      value={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
      allowClear
      onChange={(d) => {
        if (d === null) cleared = true;
      }}
    />,
  );
  const trigger = container.querySelector('[data-tao-range-trigger]')!;
  await userEvent.hover(trigger);
  await userEvent.click(screen.getByLabelText('Clear'));
  expect(cleared).toBe(true);
});

test('presets render in range picker', async () => {
  render(
    <RangePicker
      mobile={false}
      presets={[
        {
          label: 'This week',
          value: [dayjs().startOf('week'), dayjs().endOf('week')],
        },
      ]}
    />,
  );
  await userEvent.click(screen.getAllByRole('textbox')[0]);
  expect(screen.getByText('This week')).toBeTruthy();
});

test('applies semantic classes and styles to desktop parts', () => {
  const { container } = render(
    <RangePicker
      mobile={false}
      open
      className="consumer-root"
      style={{ width: 480 }}
      classNames={{
        root: 'semantic-root',
        input: 'semantic-input',
        separator: 'semantic-separator',
        popup: 'semantic-popup',
        calendar: 'semantic-calendar',
        cell: 'semantic-cell',
      }}
      styles={{
        root: { maxWidth: 640 },
        input: { color: 'red' },
        separator: { opacity: 0.8 },
        popup: { minWidth: 560 },
        calendar: { tableLayout: 'fixed' },
        cell: { opacity: 0.9 },
      }}
    />,
  );

  const root = container.querySelector(
    '[data-tao-range-trigger]',
  ) as HTMLElement;
  expect(root).toHaveClass('consumer-root', 'semantic-root');
  expect(root).toHaveStyle({ width: '480px', maxWidth: '640px' });
  expect(screen.getAllByRole('textbox')[0]).toHaveClass('semantic-input');
  expect(container.querySelector('.semantic-separator')).toHaveStyle({
    opacity: '0.8',
  });
  expect(document.querySelector('.semantic-popup')).toHaveStyle({
    minWidth: '560px',
  });
  expect(document.querySelector('.semantic-calendar')).toHaveStyle({
    tableLayout: 'fixed',
  });
  expect(document.querySelector('.semantic-cell')).toHaveStyle({
    opacity: '0.9',
  });
});

test('applies popup semantic customization in the mobile drawer', () => {
  render(
    <RangePicker
      mobile
      open
      classNames={{ popup: 'semantic-mobile-popup' }}
      styles={{ popup: { minWidth: 560 } }}
    />,
  );
  expect(document.querySelector('.semantic-mobile-popup')).toHaveStyle({
    minWidth: '560px',
  });
});
