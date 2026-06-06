import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Drawer } from '../../src/components/drawer/drawer';

test('renders children when open', () => {
  render(<Drawer open>hello drawer</Drawer>);
  expect(screen.getByText('hello drawer')).toBeTruthy();
});

test('does not render children when closed', () => {
  render(<Drawer open={false}>hidden</Drawer>);
  expect(screen.queryByText('hidden')).toBeNull();
});

test('renders title', () => {
  render(<Drawer open title="Settings">body</Drawer>);
  expect(screen.getByText('Settings')).toBeTruthy();
});

test('placement defaults to right', () => {
  render(<Drawer open>body</Drawer>);
  const content = screen.getByRole('dialog');
  expect(content.dataset.taoPlacement).toBe('right');
});

test('placement=bottom sets data attribute', () => {
  render(<Drawer open placement="bottom">body</Drawer>);
  const content = screen.getByRole('dialog');
  expect(content.dataset.taoPlacement).toBe('bottom');
});

test('close button triggers onClose', async () => {
  let closed = false;
  render(<Drawer open onClose={() => { closed = true; }}>body</Drawer>);
  const closeBtn = screen.getByLabelText('Close');
  await userEvent.click(closeBtn);
  expect(closed).toBe(true);
});

test('overlay click triggers onClose', async () => {
  let closed = false;
  render(<Drawer open onClose={() => { closed = true; }}>body</Drawer>);
  const overlay = document.querySelector('[data-tao-drawer-overlay]')!;
  await userEvent.click(overlay);
  expect(closed).toBe(true);
});

test('width prop applies to right placement', () => {
  render(<Drawer open placement="right" width={400}>body</Drawer>);
  const content = screen.getByRole('dialog');
  expect(content.style.width).toBe('400px');
});

test('height prop applies to bottom placement', () => {
  render(<Drawer open placement="bottom" height="70vh">body</Drawer>);
  const content = screen.getByRole('dialog');
  expect(content.style.height).toBe('70vh');
});
