import { expect, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { createRef, version as reactVersion, StrictMode } from 'react';
import { version as reactDomVersion } from 'react-dom';
import { Button } from '../src/components/button/button';
import { Checkbox } from '../src/components/checkbox/checkbox';
import { DatePicker } from '../src/components/date-picker/date-picker';
import { RangePicker } from '../src/components/date-picker/range-picker';
import type { PickerRef } from '../src/components/date-picker/types';
import { InputNumber } from '../src/components/input-number/input-number';
import { Radio } from '../src/components/radio/radio';
import { Select } from '../src/components/select/select';
import type { SelectRef } from '../src/components/select/select-types';
import { Switch } from '../src/components/switch/switch';
import { Textarea } from '../src/components/textarea/textarea';

test('runs the configured React and React DOM major versions', () => {
  expect(reactVersion.split('.')[0]).toBe(process.env.TAO_REACT_MAJOR);
  expect(reactDomVersion.split('.')[0]).toBe(process.env.TAO_REACT_MAJOR);
});

test.each([
  Checkbox,
  Textarea,
  InputNumber,
])('merged callback refs run each attachment cleanup exactly once (%#)', (Control) => {
  let attachments = 0;
  let cleanups = 0;
  let nullCalls = 0;
  const callback = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!node) {
      nullCalls++;
      return;
    }
    attachments++;
    return () => {
      cleanups++;
    };
  };
  const view = render(
    <StrictMode>
      <Control ref={callback} />
    </StrictMode>,
  );
  expect(attachments).toBeGreaterThan(0);
  view.unmount();
  expect(cleanups).toBe(attachments);
  expect(nullCalls).toBe(0);
});

test.each([
  Checkbox,
  Textarea,
  InputNumber,
])('replacing a merged ref cleans up the old ref and detaches a legacy ref (%#)', (Control) => {
  let attachments = 0;
  let cleanups = 0;
  const callback = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (node) {
      attachments++;
      return () => {
        cleanups++;
      };
    }
  };
  let latest: HTMLInputElement | HTMLTextAreaElement | null = null;
  const legacy = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    latest = node;
  };
  const view = render(<Control ref={callback} />);
  view.rerender(<Control ref={legacy} />);
  expect(cleanups).toBe(attachments);
  expect(latest).not.toBeNull();
  view.unmount();
  expect(latest).toBeNull();
  expect(cleanups).toBe(attachments);
});

test.each([
  Button,
  Switch,
])('button controls forward native refs (%#)', (Control) => {
  const ref = createRef<HTMLButtonElement>();
  const { unmount } = render(<Control ref={ref} />);
  expect(ref.current).toBe(document.querySelector('button'));
  ref.current?.focus();
  expect(document.activeElement).toBe(ref.current);
  unmount();
  expect(ref.current).toBeNull();
});

test.each([
  Checkbox,
  Radio,
  InputNumber,
])('input controls forward native refs (%#)', (Control) => {
  const ref = createRef<HTMLInputElement>();
  const { unmount } = render(<Control ref={ref} />);
  expect(ref.current).toBe(document.querySelector('input'));
  ref.current?.focus();
  expect(document.activeElement).toBe(ref.current);
  unmount();
  expect(ref.current).toBeNull();
});

test('Textarea forwards its native ref', () => {
  const ref = createRef<HTMLTextAreaElement>();
  const { unmount } = render(<Textarea ref={ref} />);
  expect(ref.current).toBe(screen.getByRole('textbox'));
  ref.current?.focus();
  expect(document.activeElement).toBe(ref.current);
  unmount();
  expect(ref.current).toBeNull();
});

test('Select forwards its imperative ref', () => {
  const ref = createRef<SelectRef>();
  const { unmount } = render(<Select ref={ref} options={[]} mobile={false} />);
  expect(ref.current?.nativeElement).toBe(screen.getByRole('combobox'));
  act(() => ref.current?.focus());
  expect(document.activeElement).toBe(ref.current?.nativeElement);
  act(() => ref.current?.blur());
  expect(document.activeElement).not.toBe(ref.current?.nativeElement);
  unmount();
  expect(ref.current).toBeNull();
});

test.each([
  DatePicker,
  RangePicker,
])('date controls forward their imperative refs (%#)', (Control) => {
  const ref = createRef<PickerRef>();
  const { unmount } = render(<Control ref={ref} mobile={false} />);
  const input = screen.getAllByRole('combobox')[0];
  expect(ref.current?.nativeElement).toBe(input);
  act(() => ref.current?.focus());
  expect(document.activeElement).toBe(input);
  if (Control === RangePicker) {
    act(() => ref.current?.focus('end'));
    expect(document.activeElement).toBe(screen.getAllByRole('combobox')[1]);
  }
  act(() => ref.current?.blur());
  expect(document.activeElement).not.toBe(input);
  unmount();
  expect(ref.current).toBeNull();
});
