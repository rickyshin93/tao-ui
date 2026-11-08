import {
  CopyIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FilterClearIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PlusIcon,
  PrinterIcon,
  RotateCcwIcon,
  SearchIcon,
  TruckIcon,
} from '@rockshin/tao-icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  RangePicker,
  Segmented,
  Select,
  Table,
  type TableColumn,
  Tabs,
  Tag,
  Textarea,
  Timeline,
  toast,
} from '@rockshin/tao-ui';
import type { Dayjs } from 'dayjs';
import { type Key, useEffect, useState } from 'react';

import {
  type Copy,
  type Order,
  people,
  products,
  type Status,
  SwitchRow,
  statusTone,
  today,
} from './shared';

/* ---------- orders page ---------- */

export function OrdersPage({
  t,
  lang,
  orders,
  setOrders,
}: {
  t: Copy;
  lang: 'zh' | 'en';
  orders: Order[];
  setOrders: (update: (prev: Order[]) => Order[]) => void;
}) {
  const money = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: lang === 'zh' ? 'CNY' : 'USD',
  });
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([
    today.subtract(29, 'day'),
    today,
  ]);
  const [tab, setTab] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<string | undefined>();
  const [selected, setSelected] = useState<Key[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const detail = orders.find((o) => o.id === detailId) ?? null;

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const rows = orders.filter(
    (o) =>
      (tab === 'all' || o.status === tab) &&
      (channel === undefined || String(o.channel) === channel) &&
      (!query ||
        `${o.id} ${o.customer} ${o.company} ${o.product}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );

  const setStatus = (ids: Key[], status: Status) =>
    setOrders((prev) =>
      prev.map((o) => (ids.includes(o.id) ? { ...o, status } : o)),
    );

  const ship = (ids: Key[]) => {
    setStatus(ids, 'shipped');
    setSelected([]);
    toast.success({ title: t.shipped(ids.length) });
  };

  const columns: TableColumn<Order>[] = [
    {
      key: 'id',
      dataIndex: 'id',
      title: t.cols.id,
      width: 112,
      render: (v) => <span className="tao-console-mono">{String(v)}</span>,
    },
    {
      key: 'customer',
      dataIndex: 'customer',
      title: t.cols.customer,
      render: (_, o) => (
        <div className="tao-console-person">
          <Avatar size="small">{o.customer.slice(0, 1)}</Avatar>
          <div>
            <strong>{o.customer}</strong>
            <span>{o.company}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      dataIndex: 'product',
      title: t.cols.items,
      render: (_, o) => (
        <div className="tao-console-stack">
          <span>{o.product}</span>
          <span>{t.pieces(o.qty)}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      dataIndex: 'amount',
      title: t.cols.amount,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => (
        <span className="tao-console-num">{money.format(Number(v))}</span>
      ),
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: t.cols.status,
      render: (v) => {
        const tone = statusTone[v as Status];
        const Icon = tone.icon;
        return (
          <Tag color={tone.color} icon={<Icon size={12} />}>
            {t.status[v as Status]}
          </Tag>
        );
      },
    },
    {
      key: 'channel',
      dataIndex: 'channel',
      title: t.cols.channel,
      render: (v) => t.channelNames[Number(v)],
    },
    {
      key: 'date',
      dataIndex: 'date',
      title: t.cols.date,
      sorter: (a, b) => a.date.valueOf() - b.date.valueOf(),
      render: (_, o) => (
        <span className="tao-console-muted">
          {o.date.format('MM-DD HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      width: 48,
      align: 'right',
      render: (_, o) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: stops the row click from opening the drawer behind the menu.
        // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is handled by the menu trigger button.
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                { key: 'view', label: t.view, icon: <EyeIcon size={16} /> },
                { key: 'copy', label: o.id, icon: <CopyIcon size={16} /> },
                { key: 'edit', label: t.edit, icon: <EditIcon size={16} /> },
                { type: 'divider' },
                {
                  key: 'refund',
                  label: t.refund,
                  icon: <RotateCcwIcon size={16} />,
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === 'view' || key === 'edit') setDetailId(o.id);
                if (key === 'copy')
                  toast.success({ title: t.copied, description: o.id });
                if (key === 'refund') {
                  setStatus([o.id], 'refund');
                  toast.warning({ title: t.refunded, description: o.id });
                }
              },
            }}
          >
            <Button
              variant="ghost"
              size="small"
              icon={<MoreHorizontalIcon size={16} />}
              aria-label={`${o.id} menu`}
            />
          </Dropdown>
        </span>
      ),
    },
  ];

  const exportReport = () =>
    toast.promise(new Promise((resolve) => window.setTimeout(resolve, 1400)), {
      loading: t.exporting,
      success: { title: t.exported, description: t.exportedDesc },
    });

  return (
    <>
      <div className="tao-console-title">
        <div>
          <h2>{t.pageTitle}</h2>
          <p>{t.pageSub}</p>
        </div>
        <div className="tao-console-title-actions">
          <RangePicker
            value={range}
            onChange={(dates) => setRange(dates)}
            allowClear={false}
            presets={[
              { label: t.ranges[0], value: [today.subtract(6, 'day'), today] },
              { label: t.ranges[1], value: [today.subtract(29, 'day'), today] },
            ]}
          />
          <Button
            variant="secondary"
            icon={<DownloadIcon size={16} />}
            onClick={exportReport}
          >
            {t.export}
          </Button>
          <Button
            icon={<PlusIcon size={16} />}
            onClick={() => setCreating(true)}
          >
            {t.create}
          </Button>
        </div>
      </div>

      {(counts.paid ?? 0) > 0 ? (
        <Alert
          type="warning"
          showIcon
          closable
          title={
            lang === 'zh'
              ? `${counts.paid} 笔订单等待发货，最早的已超过 24 小时`
              : `${counts.paid} orders are waiting to ship; the oldest is over 24 hours`
          }
          action={
            <Button
              size="small"
              variant="secondary"
              onClick={() => setTab('paid')}
            >
              {lang === 'zh' ? '去处理' : 'Review'}
            </Button>
          }
        />
      ) : null}
      <Card className="tao-console-orders">
        <Tabs
          activeKey={tab}
          onChange={(k) => {
            setTab(k as 'all' | Status);
            setSelected([]);
          }}
          items={(['all', 'pending', 'paid', 'shipped', 'refund'] as const).map(
            (k) => ({
              key: k,
              label: (
                <span className="tao-console-tab">
                  {t.tabs[k]}
                  <span>{k === 'all' ? orders.length : (counts[k] ?? 0)}</span>
                </span>
              ),
            }),
          )}
        />
        <div className="tao-console-toolbar">
          {selected.length ? (
            <>
              <strong>{t.selected(selected.length)}</strong>
              <Button
                size="small"
                icon={<TruckIcon size={16} />}
                onClick={() => ship(selected)}
              >
                {t.ship}
              </Button>
              <Button
                size="small"
                variant="secondary"
                icon={<PrinterIcon size={16} />}
                onClick={() => toast({ title: t.print })}
              >
                {t.print}
              </Button>
              <Button
                size="small"
                variant="ghost"
                onClick={() => setSelected([])}
              >
                {t.clear}
              </Button>
            </>
          ) : (
            <>
              <Input
                prefix={<SearchIcon size={16} />}
                allowClear
                placeholder={t.search}
                aria-label={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 260 }}
              />
              <Select
                placeholder={t.filterChannel}
                aria-label={t.filterChannel}
                allowClear
                value={channel}
                onChange={(v) => setChannel((v as string) || undefined)}
                style={{ width: 150 }}
                options={t.channelNames.map((label, i) => ({
                  label,
                  value: String(i),
                }))}
              />
              {query || channel ? (
                <Button
                  variant="ghost"
                  icon={<FilterClearIcon size={16} />}
                  onClick={() => {
                    setQuery('');
                    setChannel(undefined);
                  }}
                >
                  {t.clear}
                </Button>
              ) : null}
            </>
          )}
        </div>
        <Table<Order>
          rowKey="id"
          size="small"
          variant="modern"
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={rows}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: (keys) => setSelected(keys),
          }}
          pagination={{ pageSize: 6, showTotal: (total) => t.total(total) }}
          onRow={(o) => ({
            onClick: () => setDetailId(o.id),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <OrderDrawer
        t={t}
        order={detail}
        money={money}
        onClose={() => setDetailId(null)}
        onShip={(id) => {
          ship([id]);
          setDetailId(null);
        }}
        onRefund={(id) => {
          setStatus([id], 'refund');
          toast.warning({ title: t.refunded, description: id });
        }}
      />
      <CreateModal
        t={t}
        lang={lang}
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(order) => {
          setOrders((prev) => [order, ...prev]);
          setTab('all');
          setCreating(false);
          toast.success({ title: t.created, description: order.id });
        }}
        nextId={`TC-${20482 + orders.length - 28}`}
      />
    </>
  );
}

function OrderDrawer({
  t,
  order,
  money,
  onClose,
  onShip,
  onRefund,
}: {
  t: Copy;
  order: Order | null;
  money: Intl.NumberFormat;
  onClose: () => void;
  onShip: (id: string) => void;
  onRefund: (id: string) => void;
}) {
  const [last, setLast] = useState(order);
  useEffect(() => {
    if (order) setLast(order);
  }, [order]);
  const o = order ?? last;
  const step = o ? { pending: 1, paid: 2, shipped: 4, refund: 2 }[o.status] : 0;
  return (
    <Drawer
      open={!!order}
      onClose={onClose}
      width={440}
      title={o ? `${t.detail} · ${o.id}` : t.detail}
      extra={
        o ? (
          <Tag color={statusTone[o.status].color}>{t.status[o.status]}</Tag>
        ) : null
      }
      footer={
        o ? (
          <div className="tao-console-drawer-foot">
            <Popconfirm
              title={t.refund}
              description={`${o.id} · ${money.format(o.amount)}`}
              okButtonProps={{ variant: 'destructive' }}
              disabled={o.status === 'refund'}
              onConfirm={() => onRefund(o.id)}
            >
              <Button
                variant="ghost"
                icon={<RotateCcwIcon size={16} />}
                disabled={o.status === 'refund'}
              >
                {t.refund}
              </Button>
            </Popconfirm>
            <Button
              variant="secondary"
              icon={<PrinterIcon size={16} />}
              onClick={() => toast({ title: t.print })}
            >
              {t.print}
            </Button>
            <Button
              icon={<TruckIcon size={16} />}
              disabled={o.status !== 'paid'}
              onClick={() => onShip(o.id)}
            >
              {t.ship}
            </Button>
          </div>
        ) : null
      }
    >
      {o ? (
        <div className="tao-console-drawer">
          <div className="tao-console-drawer-hero">
            <Avatar size="large">{o.customer.slice(0, 1)}</Avatar>
            <div>
              <strong>{o.customer}</strong>
              <span>{o.company}</span>
            </div>
            <span className="tao-console-num tao-console-drawer-amount">
              {money.format(o.amount)}
            </span>
          </div>
          <Descriptions
            column={1}
            size="small"
            items={[
              {
                key: 'p',
                label: t.cols.items,
                children: `${o.product} × ${o.qty}`,
              },
              {
                key: 'c',
                label: t.cols.channel,
                children: t.channelNames[o.channel],
              },
              { key: 'pay', label: t.payment, children: t.paymentValue },
              { key: 'a', label: t.address, children: t.addressValue },
              {
                key: 'd',
                label: t.cols.date,
                children: o.date.format('YYYY-MM-DD HH:mm'),
              },
            ]}
          />
          <h4>{t.history}</h4>
          <Timeline
            items={t.events.map((e, i) => ({
              key: e,
              title: e,
              content:
                i < step
                  ? o.date.add(i * 23, 'minute').format('MM-DD HH:mm')
                  : '—',
              color: i < step ? 'green' : 'gray',
              icon:
                i === 3 && i < step ? (
                  <PackageCheckIcon size={14} />
                ) : undefined,
            }))}
          />
        </div>
      ) : null}
    </Drawer>
  );
}

function CreateModal({
  t,
  lang,
  open,
  onClose,
  onCreate,
  nextId,
}: {
  t: Copy;
  lang: 'zh' | 'en';
  open: boolean;
  onClose: () => void;
  onCreate: (o: Order) => void;
  nextId: string;
}) {
  const [form] = Form.useForm<{
    customer: string;
    product: string;
    qty: number;
    channel: string;
    note?: string;
    notify: boolean;
  }>();
  return (
    <Modal
      open={open}
      title={t.newTitle}
      okText={t.create}
      onClose={onClose}
      onOk={() => form.submit()}
      width={480}
      destroyOnHidden
    >
      <Form
        form={form}
        name="showcase-order"
        initialValues={{ qty: 1, channel: '0', notify: true }}
        onFinish={(v) => {
          const [customer, company] = people[lang][Number(v.customer)];
          const product = products[lang][Number(v.product)];
          onCreate({
            id: nextId,
            customer,
            company,
            product,
            qty: Number(v.qty),
            amount: v.qty * (129 + Number(v.product) * 40),
            status: 'pending',
            channel: Number(v.channel),
            date: today,
          });
          form.resetFields();
        }}
      >
        <Form.Item
          name="customer"
          label={t.fCustomer}
          rules={[{ required: true, message: t.required }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={people[lang].map(([name, company], i) => ({
              label: name,
              value: String(i),
              description: company,
            }))}
          />
        </Form.Item>
        <div className="tao-console-form-row">
          <Form.Item
            name="product"
            label={t.fProduct}
            rules={[{ required: true, message: t.required }]}
          >
            <Select
              options={products[lang].map((label, i) => ({
                label,
                value: String(i),
              }))}
            />
          </Form.Item>
          <Form.Item name="qty" label={t.fQty}>
            <InputNumber
              min={1}
              max={99}
              styles={{ root: { width: '100%' } }}
            />
          </Form.Item>
        </div>
        <Form.Item name="channel" label={t.fChannel}>
          <Segmented
            block
            options={t.channelNames.map((label, i) => ({
              label,
              value: String(i),
            }))}
          />
        </Form.Item>
        <Form.Item name="note" label={t.fNote}>
          <Textarea rows={2} />
        </Form.Item>
        <Form.Item name="notify" valuePropName="checked" noStyle>
          <SwitchRow label={t.fNotify} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
