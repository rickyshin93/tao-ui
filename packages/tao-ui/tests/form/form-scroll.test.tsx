import { afterEach, expect, rstest, test } from '@rstest/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  createRef,
  forwardRef,
  StrictMode,
  useImperativeHandle,
  useRef,
} from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Form, type FormInstance } from '../../src/components/form';
import { Input } from '../../src/components/input/input';
import { Select } from '../../src/components/select/select';

rstest.mock('scroll-into-view-if-needed', () => ({ default: rstest.fn() }));
afterEach(() => rstest.clearAllMocks());

test('hook, Form ref and useFormInstance expose scrolling without losing store methods', () => {
  let hookForm: FormInstance;
  let nestedForm: FormInstance;
  const ref = createRef<FormInstance>();
  function Child() {
    nestedForm = Form.useFormInstance();
    return (
      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>
    );
  }
  function Demo() {
    [hookForm] = Form.useForm();
    return (
      <Form form={hookForm} ref={ref}>
        <Child />
      </Form>
    );
  }
  render(
    <StrictMode>
      <Demo />
    </StrictMode>,
  );
  expect(nestedForm!).toBe(hookForm!);
  expect(ref.current?.scrollToField).toBe(hookForm!.scrollToField);
  act(() => hookForm!.setFieldsValue({ email: 'claim@example.com' }));
  expect(screen.getByLabelText('Email')).toHaveValue('claim@example.com');
  ref.current!.scrollToField('email');
  expect(scrollIntoView).toHaveBeenCalledWith(
    screen.getByLabelText('Email').closest('[data-tao-input]'),
    { scrollMode: 'if-needed', block: 'nearest' },
  );
});

test('passes scrolling options through, focuses only when requested and preserves the consumer ref', () => {
  const form = createRef<FormInstance>();
  const input = createRef<HTMLInputElement>();
  const { container } = render(
    <Form ref={form}>
      <Form.Item name={['claim', 'email']} label="Email">
        <Input ref={input} />
      </Form.Item>
    </Form>,
  );
  const options = {
    behavior: 'smooth',
    block: 'center',
    boundary: container,
  } as const;
  form.current!.scrollToField(['claim', 'email'], options);
  expect(document.activeElement).not.toBe(input.current);
  form.current!.scrollToField(['claim', 'email'], { ...options, focus: true });
  expect(scrollIntoView).toHaveBeenLastCalledWith(
    input.current?.closest('[data-tao-input]'),
    { scrollMode: 'if-needed', ...options },
  );
  expect(document.activeElement).toBe(input.current);
});

test('uses imperative nativeElement refs before IDs and preserves callback cleanup', () => {
  const form = createRef<FormInstance>();
  const focus = rstest.fn();
  const cleanup = rstest.fn();
  const ref = rstest.fn(() => cleanup);
  const Custom = forwardRef((_props, forwardedRef) => {
    const input = useRef<HTMLInputElement>(null);
    useImperativeHandle(forwardedRef, () => ({
      nativeElement: input.current,
      focus,
    }));
    return <input ref={input} aria-label="Custom" />;
  });
  const { unmount } = render(
    <Form ref={form}>
      <Form.Item name="custom">
        <Custom ref={ref} />
      </Form.Item>
    </Form>,
  );
  form.current!.scrollToField('custom', { focus: true });
  expect(scrollIntoView).toHaveBeenCalledWith(screen.getByLabelText('Custom'), {
    scrollMode: 'if-needed',
    block: 'nearest',
  });
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  unmount();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

test('ID-only custom controls keep explicit IDs and label associations', () => {
  const form = createRef<FormInstance>();
  function Custom({
    id,
    value,
    onChange,
  }: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input id={id} value={value} onChange={onChange} />;
  }
  render(
    <Form ref={form}>
      <Form.Item name="email" label="Email" htmlFor="claim-email">
        <Custom id="overridden-id" />
      </Form.Item>
    </Form>,
  );
  const input = screen.getByLabelText('Email');
  expect(input.id).toBe('claim-email');
  form.current!.scrollToField('email', { focus: true });
  expect(scrollIntoView).toHaveBeenCalledWith(input, {
    scrollMode: 'if-needed',
    block: 'nearest',
  });
  expect(document.activeElement).toBe(input);
});

test('forms with the same field name remain isolated even without form names', () => {
  const first = createRef<FormInstance>();
  const second = createRef<FormInstance>();
  render(
    <>
      <Form ref={first}>
        <Form.Item name="email" label="First">
          <Input />
        </Form.Item>
      </Form>
      <Form ref={second}>
        <Form.Item name="email" label="Second">
          <Input />
        </Form.Item>
      </Form>
    </>,
  );
  second.current!.scrollToField('email', { focus: true });
  expect(scrollIntoView).toHaveBeenCalledWith(
    screen.getByLabelText('Second').closest('[data-tao-input]'),
    { scrollMode: 'if-needed', block: 'nearest' },
  );
  expect(document.activeElement).toBe(screen.getByLabelText('Second'));
});

test('full List paths, noStyle fields and removed/reindexed fields resolve correctly', () => {
  const form = createRef<FormInstance>();
  render(
    <Form
      ref={form}
      initialValues={{ claims: [{ email: 'first' }, { email: 'second' }] }}
    >
      <Form.List name="claims">
        {(fields, { remove }) => (
          <>
            {fields.map((field) => (
              <Form.Item key={field.key} name={[field.name, 'email']} noStyle>
                <Input aria-label={`Email ${field.name}`} />
              </Form.Item>
            ))}
            <button type="button" onClick={() => remove(0)}>
              Remove
            </button>
          </>
        )}
      </Form.List>
    </Form>,
  );
  form.current!.scrollToField(['claims', 1, 'email'], { focus: true });
  expect(document.activeElement).toHaveValue('second');
  fireEvent.click(screen.getByText('Remove'));
  rstest.mocked(scrollIntoView).mockClear();
  form.current!.scrollToField(['claims', 1, 'email']);
  expect(scrollIntoView).not.toHaveBeenCalled();
  form.current!.scrollToField(['claims', 0, 'email']);
  expect(scrollIntoView).toHaveBeenCalledWith(
    screen.getByDisplayValue('second').closest('[data-tao-input]'),
    { scrollMode: 'if-needed', block: 'nearest' },
  );
});

test('missing and unmounted fields do not scroll', () => {
  const form = createRef<FormInstance>();
  const { rerender } = render(
    <Form ref={form}>
      <Form.Item name="email">
        <Input />
      </Form.Item>
    </Form>,
  );
  form.current!.scrollToField('missing');
  rerender(<Form ref={form} />);
  form.current!.scrollToField('email');
  expect(scrollIntoView).not.toHaveBeenCalled();
});

test.each(['first', 'second'] as const)(
  'removing the %s duplicate field keeps the remaining scroll target',
  (removed) => {
    const form = createRef<FormInstance>();
    const view = (showBoth: boolean) => (
      <Form ref={form}>
        {(showBoth || removed !== 'first') && (
          <Form.Item name="shared" key="first">
            <input id="first" />
          </Form.Item>
        )}
        {(showBoth || removed !== 'second') && (
          <Form.Item name="shared" key="second">
            <input id="second" />
          </Form.Item>
        )}
      </Form>
    );
    const { rerender } = render(view(true));
    rerender(view(false));
    const remaining = screen.getByRole('textbox');
    form.current?.scrollToField('shared', { focus: true });
    expect(remaining).toHaveFocus();
  },
);

test('distinct paths containing underscores do not collide', () => {
  const form = createRef<FormInstance>();
  render(
    <Form ref={form}>
      <Form.Item name="a_b" label="Flat">
        <Input />
      </Form.Item>
      <Form.Item name={['a', 'b']} label="Nested">
        <Input />
      </Form.Item>
    </Form>,
  );
  form.current!.scrollToField('a_b');
  expect(scrollIntoView).toHaveBeenLastCalledWith(
    screen.getByLabelText('Flat').closest('[data-tao-input]'),
    { scrollMode: 'if-needed', block: 'nearest' },
  );
  form.current!.scrollToField(['a', 'b']);
  expect(scrollIntoView).toHaveBeenLastCalledWith(
    screen.getByLabelText('Nested').closest('[data-tao-input]'),
    { scrollMode: 'if-needed', block: 'nearest' },
  );
});

test('Select imperative focus and render-function form instance work', () => {
  const form = createRef<FormInstance>();
  let renderForm: FormInstance;
  render(
    <Form ref={form}>
      <Form.Item name="policy" label="Policy">
        {(_control, _meta, instance) => {
          renderForm = instance;
          return <Select options={[{ value: 'life', label: 'Life' }]} />;
        }}
      </Form.Item>
    </Form>,
  );
  renderForm!.scrollToField('policy', { focus: true });
  expect(document.activeElement).toBe(screen.getByRole('combobox'));
});

test('failed submission can scroll to its first error through the public callback', async () => {
  function Demo() {
    const [form] = Form.useForm();
    return (
      <Form
        form={form}
        onFinishFailed={({ errorFields }) =>
          form.scrollToField(errorFields[0].name, { focus: true })
        }
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>
    );
  }
  render(<Demo />);
  fireEvent.click(screen.getByText('Submit'));
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('textbox', { name: /Email/ }),
    ),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Required');
});
