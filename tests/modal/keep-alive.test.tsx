import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Drawer } from '../../src/components/drawer/drawer';
import { Modal } from '../../src/components/modal/modal';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Count {count}
    </button>
  );
}

for (const Component of [Modal, Drawer]) {
  test(`${Component.name} releases its locks while preserving closed content`, async () => {
    const renderDialog = (open: boolean) => (
      <StrictMode>
        <button type="button">Outside</button>
        <Component open={open} title="Kept dialog" destroyOnHidden={false}>
          <Counter />
        </Component>
      </StrictMode>
    );
    const view = render(renderDialog(true));
    const dialog = screen.getByRole('dialog');
    const counter = screen.getByRole('button', { name: 'Count 0' });
    await userEvent.click(counter);
    expect(counter).toHaveTextContent('Count 1');

    view.rerender(renderDialog(false));
    expect(counter.isConnected).toBe(true);
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(document.body.style.pointerEvents).not.toBe('none');
    expect(document.body).not.toHaveAttribute('data-scroll-locked');
    const outside = screen.getByRole('button', { name: 'Outside' });
    await userEvent.click(outside);
    expect(outside).toHaveFocus();

    view.rerender(renderDialog(true));
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(screen.getByRole('button', { name: 'Count 1' })).toBe(counter);
    expect(document.body.style.pointerEvents).toBe('none');
    expect(document.body).toHaveAttribute('data-scroll-locked');
  });

  test(`${Component.name} starts hidden without locking the page`, async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Component open={false} title="Hidden dialog" destroyOnHidden={false}>
          <Counter />
        </Component>
      </>,
    );
    expect(document.body.style.pointerEvents).not.toBe('none');
    expect(document.body).not.toHaveAttribute('data-scroll-locked');
    const outside = screen.getByRole('button', { name: 'Outside' });
    await userEvent.click(outside);
    expect(outside).toHaveFocus();
  });

  test(`${Component.name} loops keyboard focus after reopening kept content`, async () => {
    const dialog = (open: boolean) => (
      <Component open={open} title="Focus dialog" destroyOnHidden={false}>
        <Counter />
      </Component>
    );
    const view = render(dialog(true));
    view.rerender(dialog(false));
    view.rerender(dialog(true));
    const buttons = screen.getByRole('dialog').querySelectorAll('button');
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
      true,
    );
    buttons[0].focus();
    await userEvent.tab({ shift: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
  });

  test(`${Component.name} updates retained content styles and close handlers`, async () => {
    const calls: string[] = [];
    const dialog = (value: string, padding: number) => (
      <Component
        open
        title="Updated dialog"
        destroyOnHidden={false}
        onClose={() => calls.push(value)}
        styles={{ root: { padding } }}
      >
        <Counter />
      </Component>
    );
    const view = render(dialog('old', 12));
    await userEvent.click(screen.getByRole('button', { name: 'Count 0' }));
    view.rerender(dialog('new', 20));
    expect(screen.getByRole('dialog')).toHaveStyle({ padding: '20px' });
    expect(screen.getByRole('button', { name: 'Count 1' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(calls).toEqual(['new']);
  });

  test(`${Component.name} preserves another open dialog's locks`, () => {
    const renderDialogs = (firstOpen: boolean, secondOpen: boolean) => (
      <>
        <button type="button">Outside</button>
        <Component open={firstOpen} title="First" destroyOnHidden={false}>
          First body
        </Component>
        <Component open={secondOpen} title="Second" destroyOnHidden={false}>
          Second body
        </Component>
      </>
    );
    const view = render(renderDialogs(true, true));
    view.rerender(renderDialogs(false, true));
    expect(document.body.style.pointerEvents).toBe('none');
    expect(document.body).toHaveAttribute('data-scroll-locked');
    expect(screen.queryByRole('button', { name: 'Outside' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Second' })).toBeTruthy();

    view.rerender(renderDialogs(false, false));
    expect(document.body.style.pointerEvents).not.toBe('none');
    expect(document.body).not.toHaveAttribute('data-scroll-locked');
    expect(screen.getByRole('button', { name: 'Outside' })).toBeTruthy();
  });

  test(`${Component.name} hydrates closed content before opening`, () => {
    const dialog = (open: boolean) => (
      <Component open={open} title="Hydrated dialog" destroyOnHidden={false}>
        <Counter />
      </Component>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(dialog(false));
    document.body.appendChild(container);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    const view = render(dialog(false), { container, hydrate: true });
    expect(document.body.style.pointerEvents).not.toBe('none');
    view.rerender(dialog(true));
    expect(
      screen.getByRole('dialog', { name: 'Hydrated dialog' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Count 0' })).toBeTruthy();
  });
}
