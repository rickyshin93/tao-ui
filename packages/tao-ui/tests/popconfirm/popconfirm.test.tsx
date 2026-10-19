import { expect, rstest, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Popconfirm } from '../../src/components/popconfirm/popconfirm';

test('click trigger opens the confirm body with title, description and buttons', async () => {
  render(
    <Popconfirm
      title="Delete this item?"
      description="This action cannot be undone."
    >
      <button type="button">Delete</button>
    </Popconfirm>,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('open');
  expect(screen.getByText('Delete this item?')).toBeTruthy();
  expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'OK' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
});

test('OK calls onConfirm and closes the popup', async () => {
  const onConfirm = rstest.fn();
  render(
    <Popconfirm title="Sure?" onConfirm={onConfirm}>
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(popup.dataset.state).toBe('open');

  await userEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(popup.dataset.state).toBe('closed');
});

test('Cancel calls onCancel and closes the popup', async () => {
  const onCancel = rstest.fn();
  render(
    <Popconfirm title="Sure?" onCancel={onCancel}>
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(popup.dataset.state).toBe('open');

  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(popup.dataset.state).toBe('closed');
});

test('custom okText and cancelText render on the buttons', async () => {
  render(
    <Popconfirm title="Sure?" okText="Yes, delete" cancelText="No, keep">
      <button type="button">Delete</button>
    </Popconfirm>,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'No, keep' })).toBeTruthy();
});

test('disabled blocks opening on click', async () => {
  render(
    <Popconfirm title="Sure?" disabled>
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(popup.dataset.state).toBe('closed');
});

test('controlled open renders the confirm body', () => {
  render(
    <Popconfirm open title="Controlled title">
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('open');
  expect(screen.getByText('Controlled title')).toBeTruthy();
});

test('controlled open={false} keeps the popup closed', async () => {
  render(
    <Popconfirm open={false} title="Hidden title">
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const popup = document.querySelector('[data-tao-popover]') as HTMLElement;
  expect(popup.dataset.state).toBe('closed');

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(popup.dataset.state).toBe('closed');
});

test('warning icon renders by default', () => {
  render(
    <Popconfirm open title="Sure?">
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  expect(document.querySelector('[data-tao-popconfirm-icon]')).not.toBeNull();
});

test('icon={null} hides the icon', () => {
  render(
    <Popconfirm open icon={null} title="Sure?">
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  expect(document.querySelector('[data-tao-popconfirm-icon]')).toBeNull();
});

test('okButtonProps are forwarded to the OK button', () => {
  render(
    <Popconfirm open title="Sure?" okButtonProps={{ loading: true }}>
      <button type="button">Delete</button>
    </Popconfirm>,
  );
  const ok = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement;
  expect(ok.disabled).toBe(true);
});

test('onOpenChange fires when opening and closing', async () => {
  const onOpenChange = rstest.fn();
  render(
    <Popconfirm title="Sure?" onOpenChange={onOpenChange}>
      <button type="button">Delete</button>
    </Popconfirm>,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onOpenChange).toHaveBeenCalledWith(true);

  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
