import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { Popconfirm } from '../../src/components/popconfirm/popconfirm';
import { TaoProvider } from '../../src/provider/tao-provider';

test.each(['OK', 'Cancel'] as const)(
  '%s composes custom click before its callback and close',
  (action) => {
    const events: string[] = [];
    const props =
      action === 'OK'
        ? {
            onConfirm: () => events.push('confirm'),
            okButtonProps: { onClick: () => events.push('click') },
          }
        : {
            onCancel: () => events.push('cancel'),
            cancelButtonProps: { onClick: () => events.push('click') },
          };
    render(
      <Popconfirm
        defaultOpen
        title="Sure?"
        {...props}
        onOpenChange={(open) => {
          if (!open) events.push('close');
        }}
      >
        <button type="button">Trigger</button>
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: action, exact: true }));
    expect(events).toEqual([
      'click',
      action === 'OK' ? 'confirm' : 'cancel',
      'close',
    ]);
    expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
      'data-state',
      'closed',
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
);

test.each(['OK', 'Cancel'] as const)(
  '%s respects custom click preventDefault',
  (action) => {
    const onAction = rs.fn();
    const onOpenChange = rs.fn();
    const onClick = (event: MouseEvent<HTMLButtonElement>) =>
      event.preventDefault();
    const props =
      action === 'OK'
        ? { onConfirm: onAction, okButtonProps: { onClick } }
        : { onCancel: onAction, cancelButtonProps: { onClick } };
    render(
      <Popconfirm
        defaultOpen
        title="Sure?"
        {...props}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: action, exact: true }));
    expect(onAction).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
      'data-state',
      'open',
    );
  },
);

test('Popconfirm inherits disabled and a local false override enables its actions', () => {
  const onConfirm = rs.fn();
  const view = render(
    <TaoProvider disabled>
      <Popconfirm title="Sure?" onConfirm={onConfirm}>
        <button type="button">Trigger</button>
      </Popconfirm>
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
  expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
    'data-state',
    'closed',
  );
  view.rerender(
    <TaoProvider disabled>
      <Popconfirm disabled={false} title="Sure?" onConfirm={onConfirm}>
        <button type="button">Trigger</button>
      </Popconfirm>
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
  const ok = screen.getByRole('button', { name: 'OK', exact: true });
  expect(ok).not.toBeDisabled();
  fireEvent.click(ok);
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test.each(['controlled', 'default'] as const)(
  'disabled suppresses a %s open Popconfirm',
  (kind) => {
    const openProps =
      kind === 'controlled' ? { open: true } : { defaultOpen: true };
    render(
      <Popconfirm {...openProps} disabled title="Unavailable">
        <button type="button">Trigger</button>
      </Popconfirm>,
    );
    expect(document.querySelector('[data-tao-popover]')).toHaveAttribute(
      'data-state',
      'closed',
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
);

test('re-enabling an uncontrolled Popconfirm does not reopen the previous prompt', () => {
  const onOpenChange = rs.fn();
  const view = (disabled: boolean) => (
    <Popconfirm
      defaultOpen
      disabled={disabled}
      title="Delete this item?"
      onOpenChange={onOpenChange}
    >
      <button type="button">Trigger</button>
    </Popconfirm>
  );
  const { rerender } = render(view(false));
  const trigger = screen.getByRole('button', { name: 'Trigger' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  rerender(view(true));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  rerender(view(false));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});
