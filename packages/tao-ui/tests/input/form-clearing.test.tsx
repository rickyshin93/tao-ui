import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Form } from '../../src/components/form';
import { Input } from '../../src/components/input/input';

for (const kind of ['Input', 'Password', 'Search', 'TextArea'] as const) {
  const Control = {
    Input,
    Password: Input.Password,
    Search: Input.Search,
    TextArea: Input.TextArea,
  }[kind];

  test(`${kind} clears the visible value when Form clears a typed field`, async () => {
    let form!: ReturnType<typeof Form.useForm>[0];
    function Demo() {
      [form] = Form.useForm();
      return (
        <Form form={form}>
          <Form.Item name="text">
            <Control aria-label="Field" />
          </Form.Item>
        </Form>
      );
    }
    render(<Demo />);
    const input = screen.getByLabelText('Field');
    await userEvent.type(input, 'hello');
    expect(form.getFieldValue('text')).toBe('hello');
    act(() => form.setFieldsValue({ text: undefined }));
    expect(form.getFieldValue('text')).toBeUndefined();
    expect(screen.getByLabelText('Field')).toBe(input);
    expect(input).toHaveValue('');
    await userEvent.type(input, 'new');
    expect(form.getFieldValue('text')).toBe('new');
  });

  test(`${kind} treats explicit undefined as controlled, including native reset`, async () => {
    const onChange = rs.fn();
    const view = render(
      <form>
        <Control
          aria-label="Field"
          value={undefined}
          defaultValue="initial"
          onChange={onChange}
        />
      </form>,
    );
    const input = screen.getByLabelText('Field');
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'edit' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('');
    fireEvent.reset(view.container.querySelector('form')!);
    await act(async () => {});
    expect(input).toHaveValue('');
  });

  test(`${kind} retains uncontrolled editing and native form reset`, async () => {
    const view = render(
      <form>
        <Control aria-label="Field" defaultValue="initial" />
      </form>,
    );
    const input = screen.getByLabelText('Field');
    fireEvent.change(input, { target: { value: 'edited' } });
    expect(input).toHaveValue('edited');
    fireEvent.reset(view.container.querySelector('form')!);
    await act(async () => {});
    expect(input).toHaveValue('initial');
  });
}
