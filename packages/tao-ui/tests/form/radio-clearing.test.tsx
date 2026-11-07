import { expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Form } from '../../src/components/form';
import { RadioGroup } from '../../src/components/radio/radio';
import { Segmented } from '../../src/components/segmented/segmented';

for (const kind of ['RadioGroup', 'Segmented'] as const) {
  const Control = kind === 'RadioGroup' ? RadioGroup : Segmented<string>;

  test(`${kind} follows Form clearing after a user selection`, () => {
    let form!: ReturnType<typeof Form.useForm>[0];
    function Demo() {
      [form] = Form.useForm();
      return (
        <Form form={form}>
          <Form.Item name="choice">
            <Control options={['A', 'B']} />
          </Form.Item>
        </Form>
      );
    }
    render(<Demo />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(form.getFieldValue('choice')).toBe('B');
    expect(radios[1]).toBeChecked();
    act(() => form.setFieldsValue({ choice: undefined }));
    expect(form.getFieldValue('choice')).toBeUndefined();
    expect(screen.getAllByRole('radio')).toEqual(radios);
    for (const radio of radios) expect(radio).not.toBeChecked();
    fireEvent.click(radios[0]);
    expect(form.getFieldValue('choice')).toBe('A');
    expect(radios[0]).toBeChecked();
  });

  test(`${kind} treats explicit undefined as controlled empty, ignoring defaultValue`, () => {
    const onChange = rs.fn();
    const view = render(
      <Control
        options={['A', 'B']}
        defaultValue="A"
        value={undefined}
        onChange={onChange}
      />,
    );
    const radios = screen.getAllByRole('radio');
    for (const radio of radios) expect(radio).not.toBeChecked();
    fireEvent.click(radios[1]);
    expect(onChange).toHaveBeenLastCalledWith('B');
    for (const radio of radios) expect(radio).not.toBeChecked();
    view.rerender(
      <Control
        options={['A', 'B']}
        defaultValue="A"
        value="B"
        onChange={onChange}
      />,
    );
    expect(radios[1]).toBeChecked();
  });

  test(`${kind} preserves uncontrolled defaults and edits`, () => {
    const view = render(<Control options={['A', 'B']} defaultValue="A" />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    fireEvent.click(radios[1]);
    view.rerender(<Control options={['A', 'B']} defaultValue="A" />);
    expect(radios[1]).toBeChecked();
  });
}
