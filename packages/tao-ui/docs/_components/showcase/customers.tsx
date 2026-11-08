import {
  MailIcon,
  MapPinIcon,
  MessageSquareIcon,
  PhoneIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from '@rockshin/tao-icons';
import {
  Avatar,
  Button,
  CheckableTag,
  ContextMenu,
  Descriptions,
  Input,
  List,
  Mentions,
  Popover,
  Rate,
  ScrollArea,
  Splitter,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  toast,
} from '@rockshin/tao-ui';
import { useState } from 'react';
import { type Lang, PageTitle, people, useL } from './shared';

const tiers = [
  'VIP',
  'Pro',
  'Pro',
  'Basic',
  'VIP',
  'Basic',
  'Pro',
  'Basic',
  'Pro',
  'VIP',
  'Basic',
  'Pro',
];

export function CustomersPage({ lang }: { lang: Lang }) {
  const L = useL();
  const list = people[lang].map(([name, company], i) => ({
    id: i,
    name,
    company,
    tier: tiers[i],
    spend: 4200 + ((i * 7919) % 38000),
    orders: 6 + ((i * 13) % 60),
    rating: 3 + ((i * 3) % 5) / 2,
  }));
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const [starred, setStarred] = useState<number[]>([0, 4]);
  const [tags, setTags] = useState<string[]>(['repeat', 'wholesale']);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ title: string; content: string }[]>([]);
  const c = list[active];
  const money = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: lang === 'zh' ? 'CNY' : 'USD',
    maximumFractionDigits: 0,
  });
  const tagOptions = [
    ['repeat', L('复购客户', 'Repeat buyer')],
    ['wholesale', L('批发', 'Wholesale')],
    ['gift', L('礼品需求', 'Gifting')],
    ['price', L('价格敏感', 'Price-sensitive')],
    ['fast', L('急单', 'Rush orders')],
  ];
  const shown = list.filter((p) =>
    `${p.name} ${p.company}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageTitle
        title={L('客户', 'Customers')}
        sub={L(
          '选择客户查看资料',
          'Select a customer to view their profile',
        )}
      />
      <div className="tao-console-split">
        <Splitter>
          <Splitter.Panel defaultSize={300} min={240} max={420}>
            <div className="tao-console-split-list">
              <Input
                prefix={<SearchIcon size={16} />}
                allowClear
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L('搜索客户', 'Search customers')}
                aria-label={L('搜索客户', 'Search customers')}
              />
              <ScrollArea maxHeight={560} scrollShadow>
                <List
                  dataSource={shown}
                  rowKey="id"
                  split={false}
                  renderItem={(p) => (
                    <ContextMenu
                      menu={{
                        items: [
                          { key: 'msg', label: L('发消息', 'Message') },
                          {
                            key: 'star',
                            label: starred.includes(p.id)
                              ? L('取消星标', 'Unstar')
                              : L('加星标', 'Star'),
                          },
                          { type: 'divider' },
                          {
                            key: 'archive',
                            label: L('归档', 'Archive'),
                            danger: true,
                          },
                        ],
                        onClick: ({ key }) => {
                          if (key === 'star')
                            setStarred((s) =>
                              s.includes(p.id)
                                ? s.filter((x) => x !== p.id)
                                : [...s, p.id],
                            );
                          else
                            toast({
                              title:
                                key === 'msg'
                                  ? L(
                                      `已打开与 ${p.name} 的会话`,
                                      `Chat with ${p.name} opened`,
                                    )
                                  : L('已归档', 'Archived'),
                            });
                        },
                      }}
                    >
                      <button
                        type="button"
                        className="tao-console-customer"
                        aria-current={p.id === active || undefined}
                        onClick={() => setActive(p.id)}
                      >
                        <Avatar>{p.name.slice(0, 1)}</Avatar>
                        <span>
                          <strong>
                            {p.name}
                            {starred.includes(p.id) ? (
                              <StarIcon size={12} />
                            ) : null}
                          </strong>
                          <span>{p.company}</span>
                        </span>
                        <Tag
                          color={
                            p.tier === 'VIP'
                              ? 'warning'
                              : p.tier === 'Pro'
                                ? 'primary'
                                : 'default'
                          }
                        >
                          {p.tier}
                        </Tag>
                      </button>
                    </ContextMenu>
                  )}
                />
              </ScrollArea>
            </div>
          </Splitter.Panel>
          <Splitter.Panel min={420}>
            <div className="tao-console-split-detail">
              <div className="tao-console-customer-head">
                <Avatar size={56}>{c.name.slice(0, 1)}</Avatar>
                <div>
                  <h3>{c.name}</h3>
                  <span>{c.company}</span>
                  <Rate allowHalf value={c.rating} disabled size="small" />
                </div>
                <div className="tao-console-title-actions">
                  <Popover
                    trigger="click"
                    title={L('联系方式', 'Contact')}
                    content={
                      <div className="tao-console-contact">
                        <span>
                          <PhoneIcon size={14} /> +86 138 0000{' '}
                          {String(1000 + active * 37).slice(0, 4)}
                        </span>
                        <span>
                          <MailIcon size={14} /> hello@
                          {c.company.toLowerCase().replace(/[^a-z]/g, '') ||
                            'shop'}
                          .com
                        </span>
                        <span>
                          <MapPinIcon size={14} />{' '}
                          {L('上海市徐汇区', 'Portland, OR')}
                        </span>
                      </div>
                    }
                  >
                    <Button variant="secondary" icon={<PhoneIcon size={16} />}>
                      {L('联系', 'Contact')}
                    </Button>
                  </Popover>
                  <Button
                    icon={<MessageSquareIcon size={16} />}
                    onClick={() =>
                      toast.success({ title: L('消息已发送', 'Message sent') })
                    }
                  >
                    {L('发消息', 'Message')}
                  </Button>
                </div>
              </div>
              <div className="tao-console-customer-stats">
                <Statistic
                  title={L('累计消费', 'Lifetime spend')}
                  value={money.format(c.spend)}
                />
                <Statistic title={L('订单数', 'Orders')} value={c.orders} />
                <Statistic
                  title={L('满意度', 'Satisfaction')}
                  value={c.rating}
                  precision={1}
                  suffix="/ 5"
                />
              </div>
              <Tabs
                items={[
                  {
                    key: 'profile',
                    label: L('资料', 'Profile'),
                    children: (
                      <Descriptions
                        bordered
                        column={2}
                        size="small"
                        items={[
                          {
                            key: 'tier',
                            label: L('会员等级', 'Tier'),
                            children: c.tier,
                          },
                          {
                            key: 'since',
                            label: L('注册时间', 'Customer since'),
                            children: '2024-03-18',
                          },
                          {
                            key: 'owner',
                            label: L('客户经理', 'Account owner'),
                            children: people[lang][(active + 3) % 12][0],
                          },
                          {
                            key: 'pay',
                            label: L('结算方式', 'Billing'),
                            children: L('月结 30 天', 'Net 30'),
                          },
                          {
                            key: 'addr',
                            label: L('收货地址', 'Ship to'),
                            children: L(
                              '上海市徐汇区漕溪北路 88 号',
                              '88 Harbor St, Portland, OR',
                            ),
                            span: 2,
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    key: 'activity',
                    label: L('跟进记录', 'Activity'),
                    children: (
                      <div className="tao-console-followup">
                        <Timeline
                          items={[
                            ...notes,
                            {
                              title: L('今天 10:24', 'Today 10:24'),
                              content: L(
                                '下单 3 件陶瓷马克杯',
                                'Ordered 3 ceramic mugs',
                              ),
                            },
                            {
                              title: L('11-02', 'Nov 2'),
                              content: L(
                                '咨询批量定制价格',
                                'Asked about bulk custom pricing',
                              ),
                            },
                            {
                              title: L('10-21', 'Oct 21'),
                              content: L(
                                '完成首次复购',
                                'First repeat purchase',
                              ),
                            },
                          ].map((item, i) => ({
                            ...item,
                            key: `${item.title}-${i}`,
                            color: i === 0 ? 'blue' : 'gray',
                          }))}
                        />
                        <div className="tao-console-comment">
                          <Mentions
                            rows={2}
                            value={note}
                            onChange={setNote}
                            placeholder={L(
                              '记录一次跟进，输入 @ 提及同事',
                              'Log a follow-up, @ to mention',
                            )}
                            options={people[lang]
                              .slice(1, 6)
                              .map(([name]) => ({ value: name, label: name }))}
                          />
                          <Button
                            icon={<SendIcon size={16} />}
                            disabled={!note.trim()}
                            onClick={() => {
                              setNotes((n) => [
                                { title: L('刚刚', 'Just now'), content: note },
                                ...n,
                              ]);
                              setNote('');
                            }}
                          >
                            {L('记录', 'Log')}
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'tags',
                    label: L('标签', 'Tags'),
                    children: (
                      <div className="tao-console-tags">
                        {tagOptions.map(([key, label]) => (
                          <CheckableTag
                            key={key}
                            checked={tags.includes(key)}
                            onChange={(on) =>
                              setTags((t) =>
                                on ? [...t, key] : t.filter((x) => x !== key),
                              )
                            }
                          >
                            {label}
                          </CheckableTag>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </>
  );
}
