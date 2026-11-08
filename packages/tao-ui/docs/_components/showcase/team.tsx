import { MailIcon, UserPlusIcon } from '@rockshin/tao-icons';
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  Popconfirm,
  Popover,
  Segmented,
  Select,
  Switch,
  Transfer,
  Tree,
  toast,
} from '@rockshin/tao-ui';
import { type Key, useState } from 'react';
import { type Lang, PageTitle, people, useL } from './shared';

const roleOf = [
  'owner',
  'admin',
  'ops',
  'support',
  'ops',
  'support',
  'ops',
  'support',
];
const rolePerms: Record<string, Key[]> = {
  admin: ['orders', 'products', 'customers', 'finance.view', 'team'],
  ops: ['orders', 'products', 'customers.view'],
  support: ['orders.view', 'orders.refund', 'customers.view'],
};

export function TeamPage({ lang }: { lang: Lang }) {
  const L = useL();
  const members = people[lang].slice(0, 8).map(([name], i) => ({
    id: String(i),
    name,
    role: roleOf[i],
    active: i !== 6,
  }));
  const [roles, setRoles] = useState(() =>
    Object.fromEntries(members.map((m) => [m.id, m.role])),
  );
  const [active, setActive] = useState(() =>
    Object.fromEntries(members.map((m) => [m.id, m.active])),
  );
  const [role, setRole] = useState('ops');
  const [perms, setPerms] = useState(rolePerms);
  const [reviewers, setReviewers] = useState<Key[]>(['1', '2']);
  const [invite, setInvite] = useState('');
  const roleOptions = [
    { label: L('管理员', 'Admin'), value: 'admin' },
    { label: L('运营', 'Operations'), value: 'ops' },
    { label: L('客服', 'Support'), value: 'support' },
  ];

  return (
    <>
      <PageTitle
        title={L('团队', 'Team')}
        sub={L(
          `${members.length} 位成员 · 3 个角色`,
          `${members.length} members · 3 roles`,
        )}
      >
        <Avatar.Group max={{ count: 4 }} size="small">
          {members.map((m) => (
            <Avatar key={m.id}>{m.name.slice(0, 1)}</Avatar>
          ))}
        </Avatar.Group>
        <Popover
          trigger="click"
          placement="bottomRight"
          title={L('邀请成员', 'Invite a teammate')}
          content={
            <div className="tao-console-invite">
              <Input
                prefix={<MailIcon size={16} />}
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                placeholder="name@company.com"
                aria-label="Email"
              />
              <Button
                disabled={!invite.includes('@')}
                onClick={() => {
                  toast.success({
                    title: L('邀请已发送', 'Invite sent'),
                    description: invite,
                  });
                  setInvite('');
                }}
              >
                {L('发送', 'Send')}
              </Button>
            </div>
          }
        >
          <Button icon={<UserPlusIcon size={16} />}>
            {L('邀请成员', 'Invite')}
          </Button>
        </Popover>
      </PageTitle>

      <div className="tao-console-row tao-console-row--even">
        <Card title={L('成员', 'Members')}>
          <List
            dataSource={members}
            rowKey="id"
            renderItem={(m) => (
              <List.Item
                actions={[
                  m.role === 'owner' ? (
                    <span key="role" className="tao-console-muted">
                      {L('所有者', 'Owner')}
                    </span>
                  ) : (
                    <Select
                      key="role"
                      size="small"
                      aria-label={L('角色', 'Role')}
                      value={roles[m.id]}
                      onChange={(v) =>
                        setRoles((r) => ({ ...r, [m.id]: v as string }))
                      }
                      options={roleOptions}
                      style={{ width: 110 }}
                    />
                  ),
                  <Switch
                    key="on"
                    size="small"
                    aria-label={L('启用', 'Active')}
                    disabled={m.role === 'owner'}
                    checked={active[m.id]}
                    onChange={(on) => setActive((a) => ({ ...a, [m.id]: on }))}
                  />,
                  m.role === 'owner' ? null : (
                    <Popconfirm
                      key="rm"
                      title={L(`移除 ${m.name}？`, `Remove ${m.name}?`)}
                      description={L(
                        '移除后将无法访问此工作区。',
                        'They will lose access to this workspace.',
                      )}
                      okText={L('移除', 'Remove')}
                      okButtonProps={{ variant: 'destructive' }}
                      onConfirm={() =>
                        toast.warning({
                          title: L('成员已移除', 'Member removed'),
                          description: m.name,
                        })
                      }
                    >
                      <Button variant="ghost" size="small">
                        {L('移除', 'Remove')}
                      </Button>
                    </Popconfirm>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{m.name.slice(0, 1)}</Avatar>}
                  title={m.name}
                  description={
                    active[m.id]
                      ? L('今天活跃', 'Active today')
                      : L('已停用', 'Deactivated')
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <div className="tao-console-stack-gap">
          <Card
            title={L('角色权限', 'Role permissions')}
            extra={
              <Segmented
                size="small"
                value={role}
                onChange={(v) => setRole(String(v))}
                options={roleOptions}
              />
            }
          >
            <Tree
              checkable
              showLine
              defaultExpandAll
              checkedKeys={perms[role]}
              onCheck={(keys) =>
                setPerms((p) => ({
                  ...p,
                  [role]: (Array.isArray(keys) ? keys : keys.checked) as Key[],
                }))
              }
              treeData={[
                {
                  key: 'orders',
                  title: L('订单', 'Orders'),
                  children: [
                    { key: 'orders.view', title: L('查看', 'View') },
                    { key: 'orders.ship', title: L('发货', 'Ship') },
                    { key: 'orders.refund', title: L('退款', 'Refund') },
                  ],
                },
                {
                  key: 'products',
                  title: L('商品', 'Products'),
                  children: [
                    { key: 'products.edit', title: L('编辑', 'Edit') },
                    { key: 'products.publish', title: L('上架', 'Publish') },
                  ],
                },
                {
                  key: 'customers',
                  title: L('客户', 'Customers'),
                  children: [
                    { key: 'customers.view', title: L('查看', 'View') },
                    { key: 'customers.export', title: L('导出', 'Export') },
                  ],
                },
                {
                  key: 'finance',
                  title: L('财务', 'Finance'),
                  children: [
                    {
                      key: 'finance.view',
                      title: L('查看报表', 'View reports'),
                    },
                    { key: 'finance.payout', title: L('提现', 'Payouts') },
                  ],
                },
                { key: 'team', title: L('团队管理', 'Team admin') },
              ]}
            />
          </Card>
          <Card title={L('退款审核组', 'Refund reviewers')}>
            <Transfer
              dataSource={members.map((m) => ({ key: m.id, title: m.name }))}
              targetKeys={reviewers}
              onChange={(keys) => setReviewers(keys)}
              titles={[L('成员', 'Members'), L('审核人', 'Reviewers')]}
              render={(item) => item.title ?? ''}
              showSearch
            />
          </Card>
        </div>
      </div>
    </>
  );
}
