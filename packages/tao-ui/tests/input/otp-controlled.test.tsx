import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { Form } from '../../src/components/form';
import { Input } from '../../src/components/input/input';

test('OTP ignores a Delete event marked as IME input by keyCode', () => {
  const onInput = rs.fn();
  render(<Input.OTP defaultValue="12" length={2} onInput={onInput} />);
  const first = screen.getAllByRole('textbox')[0];
  fireEvent.keyDown(first, { key: 'Delete', keyCode: 229 });

  expect(first).toHaveValue('1');
  expect(onInput).not.toHaveBeenCalled();
});

test('controlled OTP keeps partial input until onChange receives the complete code', async () => {
  const onChange = rs.fn();
  const onInput = rs.fn();
  function Demo() {
    const [value, setValue] = useState('');
    return (
      <Input.OTP
        length={4}
        value={value}
        onInput={onInput}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  }
  render(<Demo />);
  const user = userEvent.setup();
  const cells = screen.getAllByRole('textbox');
  await user.click(cells[0]);
  await user.keyboard('12');
  expect(cells[0]).toHaveValue('1');
  expect(cells[1]).toHaveValue('2');
  expect(cells[2]).toHaveFocus();
  expect(onChange).not.toHaveBeenCalled();
  await user.keyboard('34');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('1234');
  expect(onInput).toHaveBeenLastCalledWith(['1', '2', '3', '4']);
});

test('controlled OTP retains holes while editing and synchronizes external replacements', () => {
  const onChange = rs.fn();
  const props = { length: 4, onChange };
  const view = render(<Input.OTP {...props} value="1234" />);
  const cells = screen.getAllByRole('textbox');
  fireEvent.keyDown(cells[1], { key: 'Delete' });
  expect(cells[1]).toHaveValue('');
  expect(cells[2]).toHaveValue('3');
  expect(onChange).not.toHaveBeenCalled();
  view.rerender(<Input.OTP {...props} value="1234" />);
  expect(cells[1]).toHaveValue('');
  fireEvent.change(cells[1], { target: { value: '9' } });
  expect(onChange).toHaveBeenLastCalledWith('1934');
  view.rerender(<Input.OTP {...props} value="5678" />);
  expect(screen.getAllByRole('textbox')).toEqual(cells);
  expect(cells.map((cell) => (cell as HTMLInputElement).value)).toEqual([
    '5',
    '6',
    '7',
    '8',
  ]);
  view.rerender(<Input.OTP {...props} value={undefined} />);
  for (const cell of cells) expect(cell).toHaveValue('');
});

test('Form-bound OTP accepts a code incrementally and clears it without remounting', async () => {
  let form!: ReturnType<typeof Form.useForm>[0];
  function Demo() {
    [form] = Form.useForm();
    return (
      <Form form={form}>
        <Form.Item name="code">
          <Input.OTP length={4} />
        </Form.Item>
      </Form>
    );
  }
  render(<Demo />);
  const cells = screen.getAllByRole('textbox');
  const user = userEvent.setup();
  await user.click(cells[0]);
  await user.keyboard('1234');
  expect(form.getFieldValue('code')).toBe('1234');
  act(() => form.setFieldValue('code', undefined));
  expect(form.getFieldValue('code')).toBeUndefined();
  expect(screen.getAllByRole('textbox')).toEqual(cells);
  for (const cell of cells) expect(cell).toHaveValue('');
});

test('controlled OTP stages IME input, formats pasted text and truncates to length', () => {
  const onChange = rs.fn();
  render(
    <Input.OTP
      length={2}
      value=""
      formatter={(text) => text.toUpperCase()}
      onChange={onChange}
    />,
  );
  const cells = screen.getAllByRole('textbox');
  fireEvent.compositionStart(cells[0]);
  fireEvent.change(cells[0], { target: { value: '中' } });
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.compositionEnd(cells[0]);
  expect(cells[0]).toHaveValue('中');
  fireEvent.change(cells[1], { target: { value: '文' } });
  expect(onChange).toHaveBeenLastCalledWith('中文');
  fireEvent.paste(cells[0], { clipboardData: { getData: () => 'abcd' } });
  expect(cells[0]).toHaveValue('A');
  expect(cells[1]).toHaveValue('B');
  expect(onChange).toHaveBeenLastCalledWith('AB');
});

test('uncontrolled OTP keeps edited content when defaultValue changes', () => {
  const view = render(<Input.OTP length={2} defaultValue="12" />);
  const cells = screen.getAllByRole('textbox');
  fireEvent.change(cells[0], { target: { value: '3' } });
  view.rerender(<Input.OTP length={2} defaultValue="99" />);
  expect(cells[0]).toHaveValue('3');
  expect(cells[1]).toHaveValue('2');
});

test('Form does not submit an old complete OTP after a digit is deleted', async () => {
  const onFinish = rs.fn();
  const onFinishFailed = rs.fn();
  const onChange = rs.fn();
  const { container } = render(
    <Form
      initialValues={{ code: '1234' }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item name="code" rules={[{ required: true }]}>
        <Input.OTP length={4} onChange={onChange} />
      </Form.Item>
    </Form>,
  );
  const second = screen.getAllByRole('textbox')[1];
  fireEvent.keyDown(second, { key: 'Delete' });
  expect(onChange).not.toHaveBeenCalled();
  expect(
    screen
      .getAllByRole('textbox')
      .map((cell) => (cell as HTMLInputElement).value),
  ).toEqual(['1', '', '3', '4']);
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(onFinish).not.toHaveBeenCalled();
  expect(onFinishFailed).toHaveBeenCalled();
  fireEvent.change(second, { target: { value: '5' } });
  expect(onChange).toHaveBeenCalledExactlyOnceWith('1534');
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(onFinish).toHaveBeenCalledWith({ code: '1534' });
});
