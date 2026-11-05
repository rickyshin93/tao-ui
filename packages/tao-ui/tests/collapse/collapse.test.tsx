import { beforeAll, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
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
