import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Switch } from '../../src/components/switch/switch';
import { TaoProvider } from '../../src/provider/tao-provider';

test('renders as role=switch', () => {
  render(<Switch />);
  expect(screen.getByRole('switch')).toBeTruthy();
});

test('aria-checked reflects checked prop', () => {
  render(<Switch checked />);
  expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
});

test('aria-checked false when unchecked', () => {
  render(<Switch checked={false} />);
  expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
});

test('click triggers onChange with toggled value', async () => {
  let val = false;
  render(
    <Switch
      checked={val}
      onChange={(v) => {
        val = v;
      }}
    />,
  );
  await userEvent.click(screen.getByRole('switch'));
  expect(val).toBe(true);
});

test('defaultChecked drives uncontrolled state', async () => {
  render(<Switch defaultChecked />);
  const control = screen.getByRole('switch');
  expect(control.getAttribute('aria-checked')).toBe('true');
  await userEvent.click(control);
  expect(control.getAttribute('aria-checked')).toBe('false');
});

test('disabled prevents onChange', async () => {
  let val = false;
  render(
    <Switch
      checked={val}
      onChange={(v) => {
        val = v;
      }}
      disabled
    />,
  );
  await userEvent.click(screen.getByRole('switch'));
  expect(val).toBe(false);
});

test('loading disables interaction and shows spinner', async () => {
  let val = false;
  render(
    <Switch
      checked={val}
      onChange={(v) => {
        val = v;
      }}
      loading
    />,
  );
  const sw = screen.getByRole('switch');
  expect(sw).toBeDisabled();
  expect(sw.querySelector('[data-tao-switch-loading]')).toBeTruthy();
  await userEvent.click(sw);
  expect(val).toBe(false);
});

test('checkedChildren displayed when checked', () => {
  render(<Switch checked checkedChildren="ON" unCheckedChildren="OFF" />);
  expect(screen.getByText('ON')).toBeTruthy();
});

test('unCheckedChildren displayed when unchecked', () => {
  render(
    <Switch checked={false} checkedChildren="ON" unCheckedChildren="OFF" />,
  );
  expect(screen.getByText('OFF')).toBeTruthy();
});

test('inherits disabled from TaoProvider', () => {
  render(
    <TaoProvider disabled>
      <Switch />
    </TaoProvider>,
  );
  expect(screen.getByRole('switch')).toBeDisabled();
});

test('size=small sets data-tao-size', () => {
  render(<Switch size="small" />);
  expect(screen.getByRole('switch').dataset.taoSize).toBe('small');
});

test('defaults to size=medium', () => {
  render(<Switch />);
  expect(screen.getByRole('switch').dataset.taoSize).toBe('medium');
});
