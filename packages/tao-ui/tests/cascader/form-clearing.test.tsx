import { expect, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { Cascader } from '../../src/components/cascader/cascader';
import { Form, type FormInstance } from '../../src/components/form';

test('Form.setFieldValue(undefined) clears a Cascader after selection', async () => {
  let form!: FormInstance;
  function Example() {
    [form] = Form.useForm();
    return (
      <Form form={form}>
        <Form.Item name="location">
          <Cascader
            mobile
            defaultOpen
            options={[
              {
                value: 'cn',
                label: 'China',
                children: [{ value: 'sh', label: 'Shanghai' }],
              },
            ]}
          />
        </Form.Item>
      </Form>
    );
  }
  render(<Example />);
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByText('China'));
  fireEvent.click(within(dialog).getByText('Shanghai'));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(form.getFieldValue('location')).toEqual(['cn', 'sh']);
  expect(screen.getByTitle('China / Shanghai')).toBeInTheDocument();
  act(() => form.setFieldValue('location', undefined));
  expect(form.getFieldValue('location')).toBeUndefined();
  expect(screen.queryByTitle('China / Shanghai')).not.toBeInTheDocument();
});
