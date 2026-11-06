import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Alert } from '../../src/components/alert/alert';
import { Form } from '../../src/components/form';
import { Input } from '../../src/components/input/input';
import { Modal } from '../../src/components/modal';
import { Pagination } from '../../src/components/pagination/pagination';
import { Spinner } from '../../src/components/spinner/spinner';
import { Table } from '../../src/components/table/table';
import { Transfer } from '../../src/components/transfer/transfer';
import { Upload } from '../../src/components/upload/upload';
import { frFR } from '../../src/locales/fr-FR';
import { zhCN } from '../../src/locales/zh-CN';
import { TaoProvider, useTaoConfig } from '../../src/provider/tao-provider';

test('provider language reaches empty states, upload and accessible component names', () => {
  render(
    <TaoProvider locale={zhCN}>
      <Table columns={[]} dataSource={[]} pagination={false} />
      <Pagination total={100} />
      <Upload />
      <Alert title="Notice" closable />
      <Spinner />
    </TaoProvider>,
  );
  expect(screen.getByText(zhCN.emptyDescription)).toBeInTheDocument();
  expect(screen.getByText(zhCN.messages.uploadFile)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: zhCN.messages.previousPage }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: zhCN.messages.page(2) }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: zhCN.close })).toBeInTheDocument();
  expect(
    screen.getByRole('status', { name: zhCN.messages.loading }),
  ).toBeInTheDocument();
});

test('nested dictionaries retain siblings and update an open modal through its portal', () => {
  function Content() {
    const { locale } = useTaoConfig();
    return (
      <Modal open title="Locale" cancelText="Custom cancel">
        <span>{locale.messages.uploadFile}</span>
      </Modal>
    );
  }
  const tree = (locale: typeof zhCN) => (
    <TaoProvider locale={locale}>
      <TaoProvider locale={{ messages: { uploadFile: 'Custom upload' } }}>
        <Content />
      </TaoProvider>
    </TaoProvider>
  );
  const { rerender } = render(tree(zhCN));
  expect(screen.getByText('Custom upload')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: zhCN.ok })).toBeInTheDocument();
  rerender(tree(frFR));
  expect(screen.getByRole('button', { name: frFR.ok })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: frFR.close })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Custom cancel' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Custom upload')).toBeInTheDocument();
});

test('form defaults use translated templates while per-form and Form.Provider overrides win', async () => {
  const tree = (override: boolean) => (
    <TaoProvider locale={frFR}>
      <Form.Provider
        validateMessages={
          override ? { required: 'Tenant required' } : undefined
        }
      >
        <Form validateMessages={{ string: { min: 'Local minimum' } }}>
          <Form.Item name="name" rules={[{ required: true }, { min: 3 }]}>
            <Input aria-label="Name" />
          </Form.Item>
          <button type="submit">Validate</button>
        </Form>
      </Form.Provider>
    </TaoProvider>
  );
  const { rerender } = render(tree(false));
  await userEvent.click(screen.getByRole('button', { name: 'Validate' }));
  const template = frFR.form.required;
  if (typeof template !== 'string')
    throw new Error('Built-in required template must be a string');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    template.replaceAll(/\$\{name\}/g, 'name'),
  );
  rerender(tree(true));
  await userEvent.click(screen.getByRole('button', { name: 'Validate' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Tenant required');
  await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'a');
  await userEvent.click(screen.getByRole('button', { name: 'Validate' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Local minimum');
});

test('nested form validation overrides preserve translated sibling templates', () => {
  function Probe() {
    const { locale } = useTaoConfig();
    return <output>{JSON.stringify(locale.form)}</output>;
  }
  render(
    <TaoProvider locale={frFR}>
      <TaoProvider locale={{ form: { string: { min: 'Custom minimum' } } }}>
        <Probe />
      </TaoProvider>
    </TaoProvider>,
  );
  const actual = JSON.parse(screen.getByRole('status').textContent ?? 'null');
  expect(actual.string.min).toBe('Custom minimum');
  expect(actual.string.max).toBe(frFR.form.string?.max);
  expect(actual.required).toBe(frFR.form.required);
});

test('Transfer uses localized counts but retains explicit unit and content overrides', () => {
  const dataSource = [
    { key: 'a', title: 'A' },
    { key: 'b', title: 'B' },
  ];
  const { rerender } = render(
    <TaoProvider locale={frFR}>
      <Transfer dataSource={dataSource} render={(item) => item.title} />
    </TaoProvider>,
  );
  expect(screen.getByText(frFR.messages.itemCount(2))).toBeInTheDocument();
  expect(screen.getByText(frFR.messages.source)).toBeInTheDocument();
  rerender(
    <TaoProvider locale={frFR}>
      <Transfer
        dataSource={dataSource}
        locale={{ itemUnit: 'record', itemsUnit: 'records' }}
        render={(item) => item.title}
      />
    </TaoProvider>,
  );
  expect(screen.getByText('2 records')).toBeInTheDocument();
});

test('legacy locale identifiers still select regional component defaults without new metadata', () => {
  const {
    messages: _messages,
    form: _form,
    pickerLocale: _pickerLocale,
    dayjsLocale: _dayjsLocale,
    weekStartsOn: _weekStartsOn,
    numberLocale: _numberLocale,
    ...legacyChinese
  } = zhCN;
  function Probe() {
    const { locale } = useTaoConfig();
    return (
      <output>{`${locale.dayjsLocale}|${locale.pickerLocale?.locale}|${locale.done}`}</output>
    );
  }
  const { rerender } = render(
    <TaoProvider locale={{ ...legacyChinese, done: 'Custom done' }}>
      <Probe />
      <Upload />
    </TaoProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(
    'zh-cn|zh_CN|Custom done',
  );
  expect(screen.getByText(zhCN.messages.uploadFile)).toBeInTheDocument();
  rerender(
    <TaoProvider locale={{ locale: 'zh_CN' }}>
      <Upload />
    </TaoProvider>,
  );
  expect(screen.getByText(zhCN.messages.uploadFile)).toBeInTheDocument();
});
