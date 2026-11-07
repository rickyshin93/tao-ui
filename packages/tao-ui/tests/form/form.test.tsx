import { expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { Button } from '../../src/components/button/button';
import { Checkbox } from '../../src/components/checkbox/checkbox';
import { Form, type FormInstance } from '../../src/components/form';
import { Input } from '../../src/components/input/input';
import { InputNumber } from '../../src/components/input-number/input-number';
import { Select } from '../../src/components/select/select';
import { Switch } from '../../src/components/switch/switch';
import { Textarea } from '../../src/components/textarea/textarea';

function submitForm() {
  const form = document.querySelector('form');
  expect(form).toBeTruthy();
  fireEvent.submit(form!);
}

test('a nested Form render fragment is not decorated as a native control', () => {
  const error = rstest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(
      <Form>
        <Form.Item shouldUpdate>
          {() => (
            <>
              <Form.Item name={['contact', 'first']} label="First">
                <input />
              </Form.Item>
              <Form.Item name={['contact', 'last']} label="Last">
                <input />
              </Form.Item>
            </>
          )}
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('textbox', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Last' })).toBeInTheDocument();
    expect(error.mock.calls.flat().join(' ')).not.toContain('React.Fragment');
  } finally {
    error.mockRestore();
  }
});

test.each([false, true])(
  'render-function field keeps its composed change handler (noStyle=%s)',
  (noStyle) => {
    const form = createRef<FormInstance>();
    const observed = rstest.fn();
    render(
      <Form ref={form}>
        <Form.Item name="name" noStyle={noStyle}>
          {({ value, onChange }) => (
            <input
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => {
                if (typeof onChange === 'function') onChange(event);
                observed(event.currentTarget.value);
              }}
            />
          )}
        </Form.Item>
      </Form>,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ada' },
    });

    expect(form.current?.getFieldValue('name')).toBe('Ada');
    expect(observed).toHaveBeenCalledExactlyOnceWith('Ada');
  },
);

test.each([false, true])(
  'bound child callbacks run alongside form collection and validation (noStyle=%s)',
  async (noStyle) => {
    const form = createRef<FormInstance>();
    const onChange = rstest.fn(() => form.current?.getFieldValue('name'));
    const onBlur = rstest.fn();
    render(
      <Form ref={form}>
        <Form.Item
          name="name"
          noStyle={noStyle}
          validateTrigger="onBlur"
          rules={[{ min: 2, message: 'Use at least two characters' }]}
        >
          <input onChange={onChange} onBlur={onBlur} />
        </Form.Item>
      </Form>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.results[0].value).toBe('a');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(form.current?.getFieldError('name')).toEqual([
        'Use at least two characters',
      ]),
    );
  },
);

test.each(['error', undefined] as const)(
  'Form.Item preserves extra guidance alongside help with status %s',
  (status) => {
    render(
      <Form.Item
        label="Account"
        help="Check the account"
        extra="Use your work account"
        validateStatus={status}
      >
        <input />
      </Form.Item>,
    );
    expect(screen.getByText('Check the account')).toBeVisible();
    expect(screen.getByText('Use your work account')).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Account' }),
    ).toHaveAccessibleDescription('Check the account Use your work account');
  },
);

test('manual error status marks controls invalid without requiring a message', () => {
  render(
    <Form>
      <Form.Item label="Native" name="name" validateStatus="error">
        <input />
      </Form.Item>
      <Form.Item label="Custom" validateStatus="error">
        <Input />
      </Form.Item>
    </Form>,
  );
  for (const label of ['Native', 'Custom']) {
    const control = screen.getByRole('textbox', { name: label });
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).not.toHaveAttribute('aria-errormessage');
  }
  expect(
    screen.getByRole('textbox', { name: 'Custom' }).closest('[data-tao-input]'),
  ).toHaveAttribute('data-tao-error');
});

test.each([false, true])(
  'native select stays controlled when the form clears its value (multiple=%s)',
  (multiple) => {
    const form = createRef<FormInstance>();
    render(
      <Form ref={form} initialValues={{ choice: multiple ? ['b'] : 'b' }}>
        <Form.Item name="choice" valuePropName="value">
          <select multiple={multiple}>
            <option value="">Pick an option</option>
            <option value="b">Beta</option>
          </select>
        </Form.Item>
        <Button
          onClick={() => form.current?.setFieldsValue({ choice: undefined })}
        >
          Clear
        </Button>
      </Form>,
    );
    const select = screen.getByRole(multiple ? 'listbox' : 'combobox');
    expect(select).toHaveValue(multiple ? ['b'] : 'b');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(select).toHaveValue(multiple ? [] : '');
  },
);

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

test('required state follows a rule factory and its declared dependency', () => {
  render(
    <Form>
      <Form.Item name="mode" label="Mode">
        <input />
      </Form.Item>
      <Form.Item
        name="detail"
        label="Detail"
        dependencies={['mode']}
        rules={[
          (form) => ({ required: form.getFieldValue('mode') === 'full' }),
        ]}
      >
        <input />
      </Form.Item>
    </Form>,
  );
  const detail = screen.getByRole('textbox', { name: 'Detail' });
  expect(detail).not.toHaveAttribute('aria-required');
  fireEvent.change(screen.getByRole('textbox', { name: 'Mode' }), {
    target: { value: 'full' },
  });
  expect(detail).toHaveAttribute('aria-required', 'true');
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

test('warningOnly validation displays a warning and permits submission', async () => {
  const onFinish = rstest.fn();
  render(
    <Form onFinish={onFinish}>
      <Form.Item
        name="name"
        rules={[
          { required: true, warningOnly: true, message: 'Name is recommended' },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  expect(
    screen.getByText('Name is recommended').getAttribute('data-tao-status'),
  ).toBe('warning');
  expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBeNull();
});

test('validation warnings describe native controls without marking them invalid', async () => {
  render(
    <Form>
      <Form.Item
        name="name"
        rules={[
          { required: true, warningOnly: true, message: 'Optional name' },
        ]}
      >
        <input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  const message = await screen.findByText('Optional name');
  const input = screen.getByRole('textbox');
  expect(input.getAttribute('aria-describedby')).toBe(message.id);
  expect(input.getAttribute('aria-invalid')).toBeNull();
  expect(input.getAttribute('aria-errormessage')).toBeNull();
});

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])(
  'Form.Item labels and exposes validation on the $name Select',
  async ({ mobile, showSearch }) => {
    render(
      <Form>
        <p id="language-help">Select a supported language</p>
        <Form.Item
          label="Language"
          name="language"
          rules={[{ required: true, message: 'Language is required' }]}
        >
          <Select
            mobile={mobile}
            showSearch={showSearch}
            options={[{ label: 'Chinese', value: 'zh' }]}
            aria-describedby="language-help"
          />
        </Form.Item>
      </Form>,
    );
    const control = screen.getByRole(mobile ? 'button' : 'combobox', {
      name: 'Language',
    });
    expect(control).toHaveAttribute('aria-required', 'true');
    expect(control).toHaveAccessibleDescription('Select a supported language');
    expect(control).not.toHaveAttribute('aria-invalid');
    submitForm();
    await screen.findByText('Language is required');
    expect(control).toHaveAccessibleName('Language');
    expect(control).toHaveAccessibleDescription(
      'Select a supported language Language is required',
    );
    expect(control).toHaveAccessibleErrorMessage('Language is required');
  },
);

test('validation errors take precedence over warningOnly messages', async () => {
  const onFinish = rstest.fn();
  render(
    <Form onFinish={onFinish}>
      <Form.Item
        name="name"
        rules={[
          { required: true, warningOnly: true, message: 'Name is recommended' },
          { required: true, message: 'Name is required' },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  await screen.findByText('Name is required');
  expect(screen.queryByText('Name is recommended')).toBeNull();
  expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  expect(onFinish).not.toHaveBeenCalled();
});

test('manual help and validateStatus override validation warnings', async () => {
  const onFinish = rstest.fn();
  render(
    <Form onFinish={onFinish}>
      <Form.Item
        name="name"
        help="Review this field"
        validateStatus="error"
        rules={[
          { required: true, warningOnly: true, message: 'Name is recommended' },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>,
  );
  submitForm();
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  expect(screen.getByText('Review this field')).toBeTruthy();
  expect(screen.queryByText('Name is recommended')).toBeNull();
  expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
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
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('set'),
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
    container
      .querySelector('[data-tao-form-field]')!
      .getAttribute('data-tao-layout'),
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
  await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(2));
  await userEvent.click(screen.getByText('remove-second'));
  await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(1));
});

test.each(['multiple', 'tags'] as const)(
  'empty Form.Item supports %s Select values and reset',
  async (mode) => {
    const onFinish = rstest.fn();
    function Demo() {
      const [form] = Form.useForm();
      return (
        <>
          <Form form={form} onFinish={onFinish}>
            <Form.Item name="choices">
              <Select
                mode={mode}
                mobile={false}
                showSearch
                placeholder="Pick items"
                options={[{ label: 'Alpha', value: 'a' }]}
              />
            </Form.Item>
          </Form>
          <Button onClick={() => form.setFieldsValue({ choices: ['a'] })}>
            fill
          </Button>
          <Button onClick={() => form.resetFields()}>reset</Button>
        </>
      );
    }
    render(<Demo />);
    expect(screen.getByRole('combobox')).toHaveValue('');
    await userEvent.click(screen.getByText('fill'));
    expect(document.querySelector('[data-tao-select-tag]')).toHaveTextContent(
      'Alpha',
    );
    submitForm();
    await waitFor(() =>
      expect(onFinish).toHaveBeenLastCalledWith({ choices: ['a'] }),
    );
    await userEvent.click(screen.getByText('reset'));
    expect(document.querySelector('[data-tao-select-tag]')).toBeNull();
    await userEvent.type(
      screen.getByRole('combobox'),
      mode === 'tags' ? 'Custom{Enter}' : 'Alpha{Enter}',
    );
    submitForm();
    await waitFor(() =>
      expect(onFinish).toHaveBeenLastCalledWith({
        choices: [mode === 'tags' ? 'Custom' : 'a'],
      }),
    );
  },
);

test.each([Input, Textarea, InputNumber, 'input', 'textarea'] as const)(
  'empty text fields accept typing and reset without controlled warnings (%#)',
  async (Control) => {
    const error = rstest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      function Demo() {
        const [form] = Form.useForm();
        return (
          <>
            <Form form={form}>
              <Form.Item name="text">
                <Control />
              </Form.Item>
            </Form>
            <Button onClick={() => form.resetFields()}>reset</Button>
          </>
        );
      }
      render(<Demo />);
      await userEvent.type(screen.getByRole('textbox'), '123');
      expect(screen.getByRole('textbox')).toHaveValue('123');
      await userEvent.click(screen.getByText('reset'));
      expect(screen.getByRole('textbox')).toHaveValue('');
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  },
);

test.each([Input, Textarea])(
  'text controls keep defaultValue editable without a value prop (%#)',
  async (Control) => {
    render(<Control defaultValue="seed" />);
    expect(screen.getByRole('textbox')).toHaveValue('seed');
    await userEvent.type(screen.getByRole('textbox'), 'ed');
    expect(screen.getByRole('textbox')).toHaveValue('seeded');
  },
);

test.each([undefined, 'multiple', 'tags'] as const)(
  'setFieldsValue clears a selected %s Select without remounting',
  async (mode) => {
    const onFinish = rstest.fn();
    function Demo() {
      const [form] = Form.useForm();
      return (
        <>
          <Form form={form} onFinish={onFinish}>
            <Form.Item name="choice">
              <Select
                mode={mode}
                mobile={false}
                open
                placeholder="Pick items"
                options={[{ label: 'Alpha', value: 'a' }]}
              />
            </Form.Item>
          </Form>
          <Button onClick={() => form.setFieldsValue({ choice: undefined })}>
            clear field
          </Button>
        </>
      );
    }
    render(<Demo />);
    const trigger = document.querySelector('[data-tao-select]');
    await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(
      document.querySelector(
        mode ? '[data-tao-select-tag]' : '[data-tao-select-value]',
      ),
    ).toHaveTextContent('Alpha');
    fireEvent.click(screen.getByText('clear field'));
    expect(document.querySelector('[data-tao-select]')).toBe(trigger);
    expect(screen.getByText('Pick items')).toBeTruthy();
    expect(document.querySelector('[data-tao-select-tag]')).toBeNull();
    submitForm();
    await waitFor(() =>
      expect(onFinish).toHaveBeenCalledWith({ choice: undefined }),
    );
  },
);

test.each([
  { Control: Checkbox, role: 'checkbox', noStyle: false },
  { Control: Checkbox, role: 'checkbox', noStyle: true },
  { Control: Switch, role: 'switch', noStyle: false },
  { Control: Switch, role: 'switch', noStyle: true },
])(
  'clearing nested $role fields preserves checked binding (noStyle=$noStyle)',
  async ({ Control, role, noStyle }) => {
    const observeStore = rstest.fn();
    function Demo() {
      const [form] = Form.useForm();
      return (
        <>
          <Form form={form}>
            <Form.Item
              name={['settings', 'enabled']}
              valuePropName="checked"
              noStyle={noStyle}
            >
              <Control />
            </Form.Item>
          </Form>
          <button
            type="button"
            onClick={() => {
              form.setFieldsValue({ settings: { enabled: undefined } });
              observeStore(form.getFieldValue(['settings', 'enabled']));
            }}
          >
            Clear boolean field
          </button>
          <button
            type="button"
            onClick={() =>
              observeStore(form.getFieldValue(['settings', 'enabled']))
            }
          >
            Read boolean field
          </button>
        </>
      );
    }
    render(<Demo />);
    const control = screen.getByRole(role);
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(control).toBeChecked();
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear boolean field' }),
    );
    expect(observeStore).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByRole(role)).toBe(control);
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(control).toBeChecked();
    await userEvent.click(
      screen.getByRole('button', { name: 'Read boolean field' }),
    );
    expect(observeStore).toHaveBeenLastCalledWith(true);
  },
);

test('custom valuePropName keeps undefined values unchanged', async () => {
  function CustomControl({ selected }: { selected?: boolean }) {
    return <output data-testid="custom-selected">{String(selected)}</output>;
  }
  function Demo() {
    const [form] = Form.useForm();
    return (
      <>
        <Form form={form} initialValues={{ selection: true }}>
          <Form.Item name="selection" valuePropName="selected">
            <CustomControl />
          </Form.Item>
        </Form>
        <button
          type="button"
          onClick={() => form.setFieldsValue({ selection: undefined })}
        >
          Clear custom field
        </button>
      </>
    );
  }
  render(<Demo />);
  expect(screen.getByTestId('custom-selected')).toHaveTextContent('true');
  await userEvent.click(
    screen.getByRole('button', { name: 'Clear custom field' }),
  );
  expect(screen.getByTestId('custom-selected')).toHaveTextContent('undefined');
});

test('a bound native checkbox renders a null form value as unchecked', async () => {
  const form = createRef<FormInstance>();
  render(
    <Form ref={form} initialValues={{ consent: true }}>
      <Form.Item name="consent" valuePropName="checked">
        <input aria-label="Consent" type="checkbox" />
      </Form.Item>
    </Form>,
  );

  const consent = screen.getByRole('checkbox', { name: 'Consent' });
  expect(consent).toBeChecked();
  await act(async () => form.current?.setFieldsValue({ consent: null }));

  expect(consent).not.toBeChecked();
});

test('checked binding preserves explicit custom values', () => {
  function CustomControl({ checked }: { checked?: string }) {
    return <output data-testid="custom-checked">{checked}</output>;
  }
  render(
    <Form initialValues={{ selection: 'mixed' }}>
      <Form.Item name="selection" valuePropName="checked">
        <CustomControl />
      </Form.Item>
    </Form>,
  );
  expect(screen.getByTestId('custom-checked')).toHaveTextContent('mixed');
});
