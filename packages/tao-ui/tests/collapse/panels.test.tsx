import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Collapse } from '../../src/components/collapse/collapse';
import { TaoProvider } from '../../src/provider/tao-provider';

const items = [
  { key: 'a', label: 'Account', children: 'Account details' },
  { key: 'b', label: 'Billing', children: 'Billing details' },
];

test('item panels provide accessible headers and independent expansion', async () => {
  const user = userEvent.setup();
  const onChange = rs.fn();
  render(<Collapse items={items} onChange={onChange} />);
  const account = screen.getByRole('button', { name: 'Account' });
  expect(account).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Account details')).toBeNull();
  await user.click(account);
  const body = screen.getByRole('region', { name: 'Account' });
  expect(account).toHaveAttribute('aria-controls', body.id);
  expect(account).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('button', { name: 'Billing' }));
  expect(screen.getByText('Account details')).toBeVisible();
  expect(screen.getByText('Billing details')).toBeVisible();
  expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  await user.click(account);
  expect(screen.getByText('Account details')).not.toBeVisible();
  expect(screen.getByText('Billing details')).toBeVisible();
  expect(onChange).toHaveBeenLastCalledWith(['b']);
});

test('accordion opens one panel at a time and can close the active panel', async () => {
  const user = userEvent.setup();
  render(<Collapse accordion items={items} defaultActiveKey={['a', 'b']} />);
  expect(screen.getByText('Account details')).toBeVisible();
  expect(screen.queryByText('Billing details')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Billing' }));
  expect(screen.getByText('Account details')).not.toBeVisible();
  expect(screen.getByText('Billing details')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Billing' }));
  expect(screen.queryAllByRole('region')).toHaveLength(0);
});

test('controlled numeric keys emit strings and wait for the parent update', async () => {
  const user = userEvent.setup();
  const onChange = rs.fn();
  const numericItems = items.map((item, index) => ({ ...item, key: index }));
  const view = render(
    <Collapse items={numericItems} activeKey={0} onChange={onChange} />,
  );
  await user.click(screen.getByRole('button', { name: 'Billing' }));
  expect(onChange).toHaveBeenLastCalledWith(['0', '1']);
  expect(screen.queryByText('Billing details')).toBeNull();
  view.rerender(
    <Collapse items={numericItems} activeKey={[0, 1]} onChange={onChange} />,
  );
  expect(screen.getByText('Billing details')).toBeVisible();
});

test('headers support native Enter and Space activation', async () => {
  const user = userEvent.setup();
  render(<Collapse items={items} />);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByText('Account details')).toBeVisible();
  await user.keyboard(' ');
  expect(screen.getByText('Account details')).not.toBeVisible();
});

test('an explicitly empty controlled key overrides the default and rejects local expansion', async () => {
  const onChange = rs.fn();
  render(
    <Collapse
      items={items}
      activeKey={undefined}
      defaultActiveKey="a"
      onChange={onChange}
    />,
  );
  const account = screen.getByRole('button', { name: 'Account' });
  expect(account).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(account);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(['a']);
  expect(account).toHaveAttribute('aria-expanded', 'false');
});

test('provider and per-item disabled states prevent expansion', async () => {
  const user = userEvent.setup();
  const view = render(
    <TaoProvider disabled>
      <Collapse items={items} />
    </TaoProvider>,
  );
  expect(screen.getByRole('button', { name: 'Account' })).toBeDisabled();
  view.rerender(
    <TaoProvider disabled>
      <Collapse
        disabled={false}
        items={[items[0], { ...items[1], collapsible: 'disabled' }]}
      />
    </TaoProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.getByText('Account details')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Billing' })).toBeDisabled();
});

test('icon-only headers and extra actions do not toggle on title or extra clicks', async () => {
  const user = userEvent.setup();
  const action = rs.fn();
  render(
    <Collapse
      collapsible="icon"
      items={[
        {
          ...items[0],
          extra: (
            <button type="button" onClick={action}>
              Edit account
            </button>
          ),
        },
      ]}
    />,
  );
  await user.click(screen.getByText('Account'));
  expect(screen.queryByText('Account details')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Edit account' }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Account details')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.getByText('Account details')).toBeVisible();
});

test('extra actions also stay independent of the default full header trigger', async () => {
  const user = userEvent.setup();
  render(
    <Collapse
      items={[{ ...items[0], extra: <button type="button">Edit</button> }]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.queryByText('Account details')).toBeNull();
});

test('body state survives closing unless destroyOnHidden is enabled', async () => {
  const user = userEvent.setup();
  const form = [
    {
      key: 'form',
      label: 'Form',
      children: <input aria-label="Notes" defaultValue="Initial" />,
    },
  ];
  const view = render(<Collapse items={form} />);
  expect(screen.queryByLabelText('Notes')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Form' }));
  fireEvent.change(screen.getByLabelText('Notes'), {
    target: { value: 'Edited' },
  });
  await user.click(screen.getByRole('button', { name: 'Form' }));
  expect(screen.getByLabelText('Notes')).not.toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Form' }));
  expect(screen.getByLabelText('Notes')).toHaveValue('Edited');
  view.rerender(<Collapse items={form} destroyOnHidden />);
  await user.click(screen.getByRole('button', { name: 'Form' }));
  expect(screen.queryByLabelText('Notes')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Form' }));
  expect(screen.getByLabelText('Notes')).toHaveValue('Initial');
});

test('forceRender mounts a hidden body before the first expansion', () => {
  render(<Collapse items={[{ ...items[0], forceRender: true }]} />);
  expect(screen.getByText('Account details')).not.toBeVisible();
});

test('item semantic styles override group styles without losing classes', () => {
  const { container } = render(
    <TaoProvider size="small">
      <Collapse
        className="consumer-root"
        classNames={{
          root: 'group-root',
          header: 'group-header',
          body: 'group-body',
        }}
        styles={{ body: { padding: 10, color: 'red' } }}
        defaultActiveKey="a"
        items={[
          {
            ...items[0],
            classNames: { header: 'item-header', body: 'item-body' },
            styles: { body: { padding: 20 } },
          },
        ]}
      />
    </TaoProvider>,
  );
  expect(container.querySelector('.consumer-root')).toHaveClass('group-root');
  expect(container.querySelector('.consumer-root')).toHaveAttribute(
    'data-tao-size',
    'small',
  );
  expect(container.querySelector('.item-header')).toHaveClass('group-header');
  expect(container.querySelector('.item-body')).toHaveClass('group-body');
  expect(container.querySelector('.item-body')).toHaveStyle({
    padding: '20px',
    color: 'red',
  });
});

test('custom icons receive active state and arrow-free titles still toggle', async () => {
  const user = userEvent.setup();
  render(
    <Collapse
      expandIconPlacement="end"
      expandIcon={({ isActive }) => (
        <span>{isActive ? 'Close icon' : 'Open icon'}</span>
      )}
      items={[items[0], { ...items[1], showArrow: false }]}
    />,
  );
  expect(screen.getByText('Open icon')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.getByText('Close icon')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Billing' }));
  expect(screen.getByText('Billing details')).toBeVisible();
});

test('nested panel interaction leaves the parent panel expanded', async () => {
  const user = userEvent.setup();
  render(
    <Collapse
      defaultActiveKey="outer"
      items={[
        {
          key: 'outer',
          label: 'Outer',
          children: <Collapse items={items} />,
        },
      ]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.getByRole('button', { name: 'Outer' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByText('Account details')).toBeVisible();
});
