import { expect, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef, useState } from 'react';
import { Form, type FormInstance } from '../../src/components/form';

const required = {
  validator: async (_: unknown, value: unknown) => {
    if (!value) throw new Error('Required');
  },
};

function submitForm() {
  const form = document.querySelector('form');
  expect(form).toBeTruthy();
  fireEvent.submit(form);
}

test('controlled fields drop stale validation errors when the value changes', async () => {
  function Harness() {
    const [value, setValue] = useState('');
    return (
      <Form fields={[{ name: 'name', value }]}>
        <Form.Item name="name" rules={[required]}>
          <input />
        </Form.Item>
        <button type="button" onClick={() => setValue('fixed')}>
          Fix
        </button>
      </Form>
    );
  }

  render(<Harness />);
  submitForm();
  expect(await screen.findByText('Required')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Fix' }));
  await waitFor(() =>
    expect(screen.queryByText('Required')).not.toBeInTheDocument(),
  );
});

test('setFields drops stale validation errors when only the value changes', async () => {
  const form = createRef<FormInstance>();
  render(
    <Form ref={form}>
      <Form.Item name="name" rules={[required]}>
        <input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  await waitFor(() =>
    expect(form.current?.getFieldError('name')).toEqual(['Required']),
  );

  act(() => form.current?.setFields([{ name: 'name', value: 'fixed' }]));
  await waitFor(() => expect(form.current?.getFieldError('name')).toEqual([]));
  expect(screen.queryByText('Required')).not.toBeInTheDocument();
});

test('setFields keeps validation state the caller provides', async () => {
  const form = createRef<FormInstance>();
  render(
    <Form ref={form}>
      <Form.Item name="name" rules={[required]}>
        <input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  await waitFor(() =>
    expect(form.current?.getFieldError('name')).toEqual(['Required']),
  );

  act(() =>
    form.current?.setFields([
      { name: 'name', value: 'fixed', errors: ['Custom'] },
    ]),
  );
  await waitFor(() =>
    expect(form.current?.getFieldError('name')).toEqual(['Custom']),
  );
});

test('value-only writes through controlled fields and setFields clear stale warnings', async () => {
  const warnRule = {
    warningOnly: true,
    validator: async (_: unknown, value: unknown) => {
      if (value !== 'strong') throw new Error('Weak value');
    },
  };
  const form = createRef<FormInstance>();
  const { rerender } = render(
    <Form ref={form} fields={[{ name: 'secret', value: 'weak' }]}>
      <Form.Item name="secret" rules={[warnRule]}>
        <input />
      </Form.Item>
    </Form>,
  );

  await act(async () => {
    await form.current?.validateFields();
  });
  expect(form.current?.getFieldWarning('secret')).toEqual(['Weak value']);
  expect(screen.getByText('Weak value')).toBeInTheDocument();

  rerender(
    <Form ref={form} fields={[{ name: 'secret', value: 'strong' }]}>
      <Form.Item name="secret" rules={[warnRule]}>
        <input />
      </Form.Item>
    </Form>,
  );
  await waitFor(() =>
    expect(form.current?.getFieldWarning('secret')).toEqual([]),
  );
  expect(screen.queryByText('Weak value')).not.toBeInTheDocument();
});
