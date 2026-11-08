import { LaptopIcon, SmartphoneIcon, UploadIcon } from '@rockshin/tao-icons';
import {
  Alert,
  Button,
  Card,
  CheckboxGroup,
  Collapse,
  ColorPicker,
  Divider,
  Form,
  FormActions,
  FormField,
  Input,
  List,
  Popconfirm,
  Progress,
  QRCode,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tabs,
  Tag,
  TimeRangePicker,
  toast,
  Upload,
  Watermark,
} from '@rockshin/tao-ui';
import dayjs from 'dayjs';
import { useState } from 'react';
import { fileListFrom, hexFrom, PageTitle, useL } from './shared';

function strength(pw: string) {
  return [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw))
    .length;
}

export function SettingsPage({
  tab,
  onTab,
}: {
  tab: string;
  onTab: (tab: string) => void;
}) {
  const L = useL();
  return (
    <>
      <PageTitle
        title={L('设置', 'Settings')}
        sub={L(
          '店铺资料、安全与通知',
          'Store profile, security and notifications',
        )}
      />
      <Card>
        <Tabs
          activeKey={tab}
          onChange={onTab}
          items={[
            {
              key: 'general',
              label: L('通用', 'General'),
              children: <General />,
            },
            {
              key: 'security',
              label: L('安全', 'Security'),
              children: <Security />,
            },
            {
              key: 'notifications',
              label: L('通知', 'Notifications'),
              children: <Notifications />,
            },
          ]}
        />
      </Card>
    </>
  );
}

function General() {
  const L = useL();
  return (
    <Form
      name="showcase-settings"
      layout="horizontal"
      className="tao-console-settings"
      initialValues={{
        name: L('青禾商城', 'Fieldnote Store'),
        zone: 'asia',
        currency: 'cny',
        date: 'ymd',
        brand: '#1677ff',
        reviews: true,
      }}
      onFinish={() =>
        toast.success({ title: L('设置已保存', 'Settings saved') })
      }
    >
      <Form.Item
        name="logo"
        label={L('店铺 Logo', 'Store logo')}
        valuePropName="fileList"
        getValueFromEvent={fileListFrom}
      >
        <Upload
          listType="picture-circle"
          accept="image/*"
          maxCount={1}
          beforeUpload={() => false}
        >
          <UploadIcon size={18} />
        </Upload>
      </Form.Item>
      <Form.Item
        name="name"
        label={L('店铺名称', 'Store name')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="zone" label={L('时区', 'Time zone')}>
        <Select
          showSearch
          filterOption={(input, o) =>
            String(o?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={[
            { label: 'Asia/Shanghai (UTC+8)', value: 'asia' },
            { label: 'Europe/London (UTC+0)', value: 'london' },
            { label: 'America/Los_Angeles (UTC−8)', value: 'la' },
          ]}
        />
      </Form.Item>
      <Form.Item name="currency" label={L('结算币种', 'Currency')}>
        <RadioGroup
          options={[
            { label: 'CNY ¥', value: 'cny' },
            { label: 'USD $', value: 'usd' },
            { label: 'EUR €', value: 'eur' },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="brand"
        label={L('品牌色', 'Brand colour')}
        getValueFromEvent={hexFrom}
      >
        <ColorPicker
          showText
          presets={[
            {
              label: L('推荐', 'Recommended'),
              colors: [
                '#1677ff',
                '#16a34a',
                '#e11d74',
                '#e5372f',
                '#e8691b',
                '#1f1f1f',
              ],
            },
          ]}
        />
      </Form.Item>
      <Divider />
      <Collapse
        ghost
        items={[
          {
            key: 'advanced',
            label: L('高级设置', 'Advanced'),
            children: (
              <>
                <Form.Item
                  name="reviews"
                  label={L('开启商品评价', 'Product reviews')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="guest"
                  label={L('允许游客下单', 'Guest checkout')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="restock"
                  label={L('低库存提醒', 'Low-stock alert')}
                  initialValue={20}
                >
                  <Slider max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
                </Form.Item>
              </>
            ),
          },
        ]}
      />
      <FormActions>
        <Button variant="ghost" type="reset">
          {L('重置', 'Reset')}
        </Button>
        <Button type="submit">{L('保存', 'Save')}</Button>
      </FormActions>
    </Form>
  );
}

function Security() {
  const L = useL();
  const [pw, setPw] = useState('');
  const [enabled, setEnabled] = useState(false);
  const score = strength(pw);
  const sessions = [
    {
      id: 'mac',
      icon: LaptopIcon,
      name: 'MacBook Pro · Chrome',
      where: L('上海 · 当前设备', 'Shanghai · this device'),
      current: true,
    },
    {
      id: 'ios',
      icon: SmartphoneIcon,
      name: 'iPhone 16 · Safari',
      where: L('上海 · 2 小时前', 'Shanghai · 2 hours ago'),
    },
    {
      id: 'win',
      icon: LaptopIcon,
      name: 'Windows · Edge',
      where: L('杭州 · 3 天前', 'Hangzhou · 3 days ago'),
    },
  ];
  return (
    <div className="tao-console-security">
      {enabled ? (
        <Alert
          type="success"
          showIcon
          title={L('两步验证已开启', 'Two-step verification is on')}
        />
      ) : (
        <Alert
          type="warning"
          showIcon
          title={L('你还没有开启两步验证', 'Two-step verification is off')}
          description={L(
            '开启后，登录时需要输入验证器 App 里的 6 位动态码。',
            'You will enter a 6-digit code from your authenticator app at sign-in.',
          )}
        />
      )}
      <div className="tao-console-row tao-console-row--even">
        <Card size="small" title={L('两步验证', 'Two-step verification')}>
          <div className="tao-console-2fa">
            <QRCode
              value="otpauth://totp/tao-console?secret=TAOUISHOWCASE"
              type="svg"
              size={132}
              status={enabled ? 'scanned' : undefined}
            />
            <FormField
              label={L('输入 6 位验证码', 'Enter the 6-digit code')}
              description={L(
                '任意 6 位数字即可体验',
                'Any 6 digits works in this demo',
              )}
            >
              <Input.OTP
                length={6}
                onChange={(code) => {
                  if (code.length === 6) {
                    setEnabled(true);
                    toast.success({ title: L('验证成功', 'Verified') });
                  }
                }}
              />
            </FormField>
          </div>
        </Card>
        <Card size="small" title={L('修改密码', 'Change password')}>
          <div className="tao-console-stack-gap">
            <FormField label={L('新密码', 'New password')}>
              <Input.Password
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </FormField>
            <Progress
              percent={score * 25}
              steps={4}
              showInfo={false}
              strokeColor={
                score >= 3
                  ? 'var(--tao-color-success)'
                  : score === 2
                    ? 'var(--tao-color-warning)'
                    : 'var(--tao-color-error)'
              }
            />
            <span className="tao-console-muted">
              {L(
                '至少 8 位，包含大写字母、数字和符号',
                '8+ characters with an uppercase letter, a number and a symbol',
              )}
            </span>
            <Button
              disabled={score < 3}
              onClick={() =>
                toast.success({ title: L('密码已更新', 'Password updated') })
              }
            >
              {L('更新密码', 'Update password')}
            </Button>
          </div>
        </Card>
      </div>
      <Watermark
        content={L('林知夏 · 仅限内部', 'Maya Chen · internal')}
        font={{ fontSize: 13 }}
        gap={[120, 80]}
      >
        <Card size="small" title={L('登录设备', 'Signed-in devices')}>
          <List
            dataSource={sessions}
            rowKey="id"
            renderItem={(s) => (
              <List.Item
                actions={[
                  s.current ? (
                    <Tag key="c" color="success">
                      {L('当前', 'Current')}
                    </Tag>
                  ) : (
                    <Popconfirm
                      key="out"
                      title={L('让该设备下线？', 'Sign out this device?')}
                      onConfirm={() =>
                        toast({ title: L('设备已下线', 'Device signed out') })
                      }
                    >
                      <Button size="small" variant="ghost">
                        {L('下线', 'Sign out')}
                      </Button>
                    </Popconfirm>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<s.icon size={20} />}
                  title={s.name}
                  description={s.where}
                />
              </List.Item>
            )}
          />
        </Card>
      </Watermark>
    </div>
  );
}

function Notifications() {
  const L = useL();
  const channels = [
    { label: L('站内', 'In-app'), value: 'app' },
    { label: L('邮件', 'Email'), value: 'email' },
    { label: L('短信', 'SMS'), value: 'sms' },
  ];
  const events = [
    [L('新订单', 'New order'), ['app', 'email']],
    [L('退款申请', 'Refund request'), ['app', 'email', 'sms']],
    [L('库存不足', 'Low stock'), ['app']],
    [L('周报', 'Weekly report'), ['email']],
  ] as const;
  return (
    <div className="tao-console-notify">
      {events.map(([label, value]) => (
        <div key={label} className="tao-console-notify-row">
          <strong>{label}</strong>
          <CheckboxGroup options={channels} defaultValue={[...value]} />
        </div>
      ))}
      <Divider />
      <div className="tao-console-form-row tao-console-form-row--even">
        <FormField label={L('免打扰时段', 'Quiet hours')}>
          <TimeRangePicker
            format="HH:mm"
            defaultValue={[
              dayjs('2026-11-08T22:00'),
              dayjs('2026-11-09T08:00'),
            ]}
          />
        </FormField>
        <FormField label={L('汇总频率（小时）', 'Digest every (hours)')}>
          <Slider
            min={1}
            max={24}
            defaultValue={4}
            marks={{ 1: '1', 12: '12', 24: '24' }}
          />
        </FormField>
      </div>
    </div>
  );
}
