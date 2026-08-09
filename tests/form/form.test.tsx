import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../../src/components/button/button';
import { Form } from '../../src/components/form';
import { Input } from '../../src/components/input/input';

function submitForm() {
  const form = document.querySelector('form');
  expect(form).toBeTruthy();
  fireEvent.submit(form!);
}

function LoginForm({
  onFinish,
  onFinishFailed,
}: {
  onFinish?: (values: Record<string, unknown>) => void;
  onFinishFailed?: (info: unknown) => void;
}) {
  return (
    <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: 'Username is required' }]}
      >
        <Input />
      </Form.Item>
      <Button type="submit">Sign in</Button>
    </Form>
  );
}

// ---- Rendering ----

test('renders label, control and required mark inferred from rules', () => {
  const { container } = render(<LoginForm />);
  expect(screen.getByText('Username')).toBeTruthy();
  expect(screen.getByRole('textbox')).toBeTruthy();
  expect(container.querySelector('[data-tao-required]')).toBeTruthy();
});

test('presentational item without name renders shell only', () => {
  const { container } = render(
    <Form>
      <Form.Item label="Note" help="Just a hint">
        <Input />
      </Form.Item>
    </Form>,
  );
  expect(screen.getByText('Note')).toBeTruthy();
  expect(screen.getByText('Just a hint')).toBeTruthy();
  expect(container.querySelector('[data-tao-form-field]')).toBeTruthy();
});

// ---- Validation & submit ----

test('valid submit calls onFinish with collected values', async () => {
  const onFinish = rstest.fn();
  render(<LoginForm onFinish={onFinish} />);
  await userEvent.type(screen.getByRole('textbox'), 'tao');
  submitForm();
  await waitFor(() =>
    expect(onFinish).toHaveBeenCalledWith({ username: 'tao' }),
  );
});

test('required rule blocks submit, shows error and marks control invalid', async () => {
  const onFinish = rstest.fn();
  const onFinishFailed = rstest.fn();
  const { container } = render(
    <LoginForm onFinish={onFinish} onFinishFailed={onFinishFailed} />,
  );
  submitForm();
  await waitFor(() =>
    expect(screen.getByText('Username is required')).toBeTruthy(),
  );
  expect(onFinish).not.toHaveBeenCalled();
  expect(onFinishFailed).toHaveBeenCalled();
  const input = screen.getByRole('textbox');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  // status pushed into the tao control → error visuals
  expect(container.querySelector('[data-tao-error]')).toBeTruthy();
});

test('error clears on retype (validateTrigger onChange)', async () => {
  render(<LoginForm />);
  submitForm();
  await waitFor(() =>
    expect(screen.getByText('Username is required')).toBeTruthy(),
  );
  await userEvent.type(screen.getByRole('textbox'), 't');
  await waitFor(() =>
    expect(screen.queryByText('Username is required')).toBeNull(),
  );
});

test('pattern rule rejects invalid values', async () => {
  render(
    <Form>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ pattern: /@/, message: 'Invalid email' }]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  await userEvent.type(screen.getByRole('textbox'), 'not-an-email');
  await waitFor(() => expect(screen.getByText('Invalid email')).toBeTruthy());
});

test('async validator surfaces the rejection message', async () => {
  render(
    <Form>
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            validator: (_, value) =>
              value === 'taken'
                ? Promise.reject(new Error('Name taken'))
                : Promise.resolve(),
          },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  await userEvent.type(screen.getByRole('textbox'), 'taken');
  await waitFor(() => expect(screen.getByText('Name taken')).toBeTruthy());
});

// ---- Values ----

test('initialValues populate controls', () => {
  render(
    <Form initialValues={{ username: 'seed' }}>
      <Form.Item name="username" label="Username">
        <Input />
      </Form.Item>
    </Form>,
  );
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('seed');
});

test('Form.useForm exposes imperative setFieldsValue/resetFields', async () => {
  function Demo() {
    const [form] = Form.useForm();
    return (
      <>
        <Form form={form}>
          <Form.Item name="username" label="Username">
            <Input />
          </Form.Item>
        </Form>
        <Button onClick={() => form.setFieldsValue({ username: 'set' })}>
          fill
        </Button>
        <Button onClick={() => form.resetFields()}>reset</Button>
      </>
    );
  }
  render(<Demo />);
  await userEvent.click(screen.getByText('fill'));
  await waitFor(() =>
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      'set',
    ),
  );
  await userEvent.click(screen.getByText('reset'));
  await waitFor(() =>
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(''),
  );
});

test('dependencies revalidate the dependent field', async () => {
  render(
    <Form>
      <Form.Item name="password" label="Password">
        <Input />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="Confirm"
        dependencies={['password']}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, value) =>
              !value || getFieldValue('password') === value
                ? Promise.resolve()
                : Promise.reject(new Error('Mismatch')),
          }),
        ]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  const inputs = screen.getAllByRole('textbox');
  await userEvent.type(inputs[0], 'abc');
  await userEvent.type(inputs[1], 'abd');
  await waitFor(() => expect(screen.getByText('Mismatch')).toBeTruthy());
  // fixing the dependency re-validates the dependent field
  await userEvent.clear(inputs[0]);
  await userEvent.type(inputs[0], 'abd');
  await waitFor(() => expect(screen.queryByText('Mismatch')).toBeNull());
});

// ---- Structure variants ----

test('noStyle keeps the binding but drops the shell', async () => {
  const onFinish = rstest.fn();
  const { container } = render(
    <Form onFinish={onFinish}>
      <Form.Item name="username" noStyle>
        <Input />
      </Form.Item>
    </Form>,
  );
  expect(container.querySelector('[data-tao-form-field]')).toBeNull();
  await userEvent.type(screen.getByRole('textbox'), 'tao');
  submitForm();
  await waitFor(() =>
    expect(onFinish).toHaveBeenCalledWith({ username: 'tao' }),
  );
});

test('layout="horizontal" marks items horizontal', () => {
  const { container } = render(
    <Form layout="horizontal">
      <Form.Item name="username" label="Username">
        <Input />
      </Form.Item>
    </Form>,
  );
  expect(
    container.querySelector('[data-tao-form-field]')!.getAttribute(
      'data-tao-layout',
    ),
  ).toBe('horizontal');
});

// ---- Provider cascade ----

test('Form size/disabled cascade into controls', () => {
  const { container } = render(
    <Form size="small" disabled>
      <Form.Item name="username" label="Username">
        <Input />
      </Form.Item>
    </Form>,
  );
  const control = container.querySelector('[data-tao-input]') as HTMLElement;
  expect(control.dataset.taoSize).toBe('small');
  expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
});

// ---- useWatch ----

test('Form.useWatch tracks a field value', async () => {
  function Watcher() {
    const value = Form.useWatch('username');
    return <output>{String(value ?? '')}</output>;
  }
  render(
    <Form initialValues={{ username: 'init' }}>
      <Form.Item name="username" label="Username">
        <Input />
      </Form.Item>
      <Watcher />
    </Form>,
  );
  expect(screen.getByText('init')).toBeTruthy();
  await userEvent.clear(screen.getByRole('textbox'));
  await userEvent.type(screen.getByRole('textbox'), 'next');
  await waitFor(() => expect(screen.getByText('next')).toBeTruthy());
});

// ---- Form.List ----

test('Form.List adds and removes dynamic rows', async () => {
  function Demo() {
    return (
      <Form initialValues={{ users: ['first'] }}>
        <Form.List name="users">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`User ${field.name}`}
                >
                  <Input />
                </Form.Item>
              ))}
              <Button onClick={() => add()}>add</Button>
              <Button onClick={() => remove(1)}>remove-second</Button>
            </>
          )}
        </Form.List>
      </Form>
    );
  }
  render(<Demo />);
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
  await userEvent.click(screen.getByText('add'));
  await waitFor(() =>
    expect(screen.getAllByRole('textbox')).toHaveLength(2),
  );
  await userEvent.click(screen.getByText('remove-second'));
  await waitFor(() =>
    expect(screen.getAllByRole('textbox')).toHaveLength(1),
  );
});
