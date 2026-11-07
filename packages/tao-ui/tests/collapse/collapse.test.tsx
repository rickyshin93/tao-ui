import { beforeAll, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Collapse } from '../../src/components/collapse/collapse';
import { TaoProvider } from '../../src/provider/tao-provider';

// Radix relies on a few DOM APIs jsdom doesn't implement.
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
});

function Basic(props: React.ComponentProps<typeof Collapse>) {
  return (
    <Collapse {...props}>
      <Collapse.Trigger>Toggle</Collapse.Trigger>
      <Collapse.Content>Panel body</Collapse.Content>
    </Collapse>
  );
}

test('renders trigger; content hidden when closed', () => {
  render(<Basic />);
  expect(screen.getByText('Toggle')).toBeTruthy();
  expect(screen.queryByText('Panel body')).toBeNull();
});

test('content visible when defaultOpen', () => {
  render(<Basic defaultOpen />);
  expect(screen.getByText('Panel body')).toBeTruthy();
});

test('clicking trigger expands the panel', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  expect(screen.queryByText('Panel body')).toBeNull();
  await user.click(screen.getByText('Toggle'));
  expect(screen.getByText('Panel body')).toBeTruthy();
});

test('controlled open + onOpenChange fires', async () => {
  const user = userEvent.setup();
  const calls: boolean[] = [];
  render(<Basic open={false} onOpenChange={(o) => calls.push(o)} />);
  // Controlled & closed: content not shown.
  expect(screen.queryByText('Panel body')).toBeNull();
  await user.click(screen.getByText('Toggle'));
  // Parent didn't flip `open`, so it stays closed, but the callback fired.
  expect(calls).toEqual([true]);
  expect(screen.queryByText('Panel body')).toBeNull();
});

test('disabled trigger does not toggle', async () => {
  const user = userEvent.setup();
  const calls: boolean[] = [];
  render(<Basic disabled onOpenChange={(o) => calls.push(o)} />);
  await user.click(screen.getByText('Toggle'));
  expect(calls).toEqual([]);
  expect(screen.queryByText('Panel body')).toBeNull();
});

test('inherits disabled from TaoProvider', async () => {
  const user = userEvent.setup();
  const calls: boolean[] = [];
  render(
    <TaoProvider disabled>
      <Basic onOpenChange={(o) => calls.push(o)} />
    </TaoProvider>,
  );
  await user.click(screen.getByText('Toggle'));
  expect(calls).toEqual([]);
});

test('semantic classNames/styles apply to parts', () => {
  render(
    <Collapse
      defaultOpen
      className="my-root"
      classNames={{ trigger: 'my-trigger', content: 'my-content' }}
      styles={{ trigger: { color: 'rgb(1, 2, 3)' } }}
    >
      <Collapse.Trigger>Toggle</Collapse.Trigger>
      <Collapse.Content>Panel body</Collapse.Content>
    </Collapse>,
  );
  expect(document.querySelector('.my-root')).toBeTruthy();
  const trigger = document.querySelector('.my-trigger') as HTMLElement;
  expect(trigger).toBeTruthy();
  expect(trigger.style.color).toBe('rgb(1, 2, 3)');
  expect(document.querySelector('.my-content')).toBeTruthy();
});

test('disabled custom link triggers cannot toggle or navigate', () => {
  const onOpenChange = rs.fn();
  render(
    <Collapse disabled onOpenChange={onOpenChange}>
      <Collapse.Trigger asChild>
        <a href="#details" tabIndex={0} aria-disabled={false}>
          Details
        </a>
      </Collapse.Trigger>
      <Collapse.Content>Expanded details</Collapse.Content>
    </Collapse>,
  );
  const trigger = screen.getByRole('link', { name: 'Details' });
  expect(trigger).not.toHaveAttribute('href');
  expect(fireEvent.click(trigger)).toBe(false);
  expect(
    fireEvent(
      trigger,
      new MouseEvent('auxclick', {
        button: 1,
        bubbles: true,
        cancelable: true,
      }),
    ),
  ).toBe(false);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveAttribute('aria-disabled', 'true');
  expect(trigger).toHaveAttribute('tabindex', '-1');
});

test('opening a panel after a data update omits keys for removed panels', () => {
  const onChange = rs.fn();
  const first = { key: 'first', label: 'First', children: 'First panel' };
  const second = { key: 'second', label: 'Second', children: 'Second panel' };
  const view = render(
    <Collapse
      items={[first, second]}
      defaultActiveKey="first"
      onChange={onChange}
    />,
  );
  view.rerender(
    <Collapse items={[second]} defaultActiveKey="first" onChange={onChange} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Second' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(['second']);
});

test('a consumer changing onChange keys does not overwrite open panels', () => {
  render(
    <Collapse
      items={[{ key: 'details', label: 'Details', children: 'Expanded' }]}
      onChange={(keys) => {
        keys.splice(0);
      }}
    />,
  );
  const trigger = screen.getByRole('button', { name: 'Details' });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Expanded')).toBeVisible();
});
