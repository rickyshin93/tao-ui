import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImagePlusIcon,
  SaveIcon,
  SendIcon,
} from '@rockshin/tao-icons';
import {
  Affix,
  AutoComplete,
  Badge,
  Button,
  Card,
  Cascader,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  DatePicker,
  Divider,
  Form,
  FormActions,
  FormSection,
  Image,
  Input,
  InputNumber,
  Mentions,
  QRCode,
  RadioGroup,
  Result,
  Select,
  Slider,
  Steps,
  Switch,
  Textarea,
  TimePicker,
  TreeSelect,
  toast,
  Upload,
} from '@rockshin/tao-ui';
import { useState } from 'react';
import {
  fileListFrom,
  hexFrom,
  type Lang,
  PageTitle,
  people,
  today,
  useL,
} from './shared';

type ProductForm = {
  name: string;
  brand?: string;
  category?: string[];
  warehouse?: string;
  tags?: string[];
  description?: string;
  images?: unknown[];
  price?: number;
  cost?: number;
  discount: number;
  pricing: string;
  channels: string[];
  stock?: number;
  color?: string;
  publish: string;
  date?: unknown;
  time?: unknown;
  featured: boolean;
  notify?: string;
  agree: boolean;
};

const stepFields: (keyof ProductForm)[][] = [
  ['name', 'brand', 'category', 'warehouse', 'tags', 'description', 'images'],
  ['price', 'cost', 'discount', 'pricing', 'channels', 'stock', 'color'],
  ['publish', 'date', 'time', 'featured', 'notify', 'agree'],
];

const swatch = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 88%)"/><stop offset="1" stop-color="hsl(${hue + 30} 60% 70%)"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)"/><rect x="170" y="110" width="140" height="150" rx="18" fill="white" fill-opacity=".85"/><rect x="200" y="80" width="80" height="40" rx="14" fill="none" stroke="white" stroke-width="10"/></svg>`,
  )}`;

function hueOf(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!d) return 220;
  const h =
    max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return Math.round(h * 60 + 360) % 360;
}

export function ProductsPage({ lang }: { lang: Lang }) {
  const L = useL();
  const [form] = Form.useForm<ProductForm>();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const values = Form.useWatch([], form) as Partial<ProductForm> | undefined;
  const currency = lang === 'zh' ? '¥' : '$';

  const next = async () => {
    await form.validateFields(stepFields[step]);
    setStep((s) => s + 1);
  };

  if (done) {
    return (
      <Card>
        <Result
          status="success"
          title={L('商品已提交审核', 'Product submitted for review')}
          subTitle={L(
            `「${values?.name ?? ''}」通常会在 10 分钟内上架，审核结果会通知到你。`,
            `"${values?.name ?? ''}" usually goes live within 10 minutes. We will notify you.`,
          )}
          extra={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  toast.info({
                    title: L('已打开商品页', 'Product page opened'),
                  })
                }
              >
                {L('查看商品', 'View product')}
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setStep(0);
                  setDone(false);
                }}
              >
                {L('继续新建', 'Create another')}
              </Button>
            </>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <PageTitle
        title={L('新建商品', 'New product')}
        sub={L(
          '分三步完成，草稿会自动保存',
          'Three steps; drafts save automatically',
        )}
      />
      <Card className="tao-console-steps">
        <Steps
          current={step}
          onChange={(s) => s < step && setStep(s)}
          items={[
            {
              title: L('基本信息', 'Basics'),
              content: L('名称、类目与图片', 'Name, category, images'),
            },
            {
              title: L('价格与库存', 'Price & stock'),
              content: L('定价、渠道与规格', 'Pricing, channels, variants'),
            },
            {
              title: L('发布设置', 'Publishing'),
              content: L('上架时间与通知', 'Schedule and notify'),
            },
          ]}
        />
      </Card>

      <div className="tao-console-form-grid">
        <Card>
          <Form
            form={form}
            name="showcase-product"
            initialValues={{
              discount: 10,
              pricing: 'fixed',
              channels: ['web', 'app'],
              publish: 'now',
              featured: true,
              agree: false,
              color: '#1677ff',
              category: ['home', 'kitchen', 'mug'],
            }}
            onFinish={() => setDone(true)}
          >
            {step === 0 ? (
              <>
                <FormSection
                  title={L('基本信息', 'Basics')}
                  description={L(
                    '买家在列表和详情页看到的内容。',
                    'What buyers see in lists and detail pages.',
                  )}
                >
                  <Form.Item
                    name="name"
                    label={L('商品名称', 'Product name')}
                    rules={[
                      {
                        required: true,
                        message: L('请填写商品名称', 'Enter a product name'),
                      },
                    ]}
                  >
                    <Input
                      showCount
                      maxLength={30}
                      placeholder={L(
                        '例如：手作陶瓷马克杯',
                        'e.g. Handmade ceramic mug',
                      )}
                    />
                  </Form.Item>
                  <div className="tao-console-form-row tao-console-form-row--even">
                    <Form.Item name="brand" label={L('品牌', 'Brand')}>
                      <AutoComplete
                        placeholder={L(
                          '输入以搜索品牌',
                          'Type to search brands',
                        )}
                        options={[
                          'Tao Studio',
                          'Fieldnote',
                          'Kiln & Co.',
                          'Northbound',
                        ].map((v) => ({ value: v, label: v }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name="category"
                      label={L('类目', 'Category')}
                      rules={[{ required: true }]}
                    >
                      <Cascader
                        showSearch
                        options={[
                          {
                            value: 'home',
                            label: L('家居', 'Home'),
                            children: [
                              {
                                value: 'kitchen',
                                label: L('厨房', 'Kitchen'),
                                children: [
                                  { value: 'mug', label: L('杯具', 'Mugs') },
                                  {
                                    value: 'plate',
                                    label: L('餐盘', 'Plates'),
                                  },
                                ],
                              },
                              {
                                value: 'decor',
                                label: L('装饰', 'Decor'),
                                children: [
                                  {
                                    value: 'candle',
                                    label: L('香薰', 'Candles'),
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            value: 'apparel',
                            label: L('服饰', 'Apparel'),
                            children: [
                              {
                                value: 'bags',
                                label: L('包袋', 'Bags'),
                                children: [
                                  {
                                    value: 'tote',
                                    label: L('托特包', 'Totes'),
                                  },
                                ],
                              },
                            ],
                          },
                        ]}
                      />
                    </Form.Item>
                  </div>
                  <div className="tao-console-form-row tao-console-form-row--even">
                    <Form.Item
                      name="warehouse"
                      label={L('发货仓', 'Ships from')}
                    >
                      <TreeSelect
                        placeholder={L('选择仓库', 'Choose a warehouse')}
                        treeDefaultExpandAll
                        treeData={[
                          {
                            value: 'east',
                            title: L('华东', 'East'),
                            children: [
                              {
                                value: 'sh',
                                title: L('上海一号仓', 'Shanghai 1'),
                              },
                              {
                                value: 'hz',
                                title: L('杭州中心仓', 'Hangzhou hub'),
                              },
                            ],
                          },
                          {
                            value: 'south',
                            title: L('华南', 'South'),
                            children: [
                              { value: 'gz', title: L('广州仓', 'Guangzhou') },
                            ],
                          },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="tags" label={L('标签', 'Tags')}>
                      <Select
                        mode="tags"
                        placeholder={L('回车添加', 'Press Enter to add')}
                        options={[
                          L('新品', 'New'),
                          L('限量', 'Limited'),
                          L('礼盒', 'Gift box'),
                        ].map((v) => ({ label: v, value: v }))}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="description"
                    label={L('商品描述', 'Description')}
                  >
                    <Textarea rows={3} showCount maxLength={200} />
                  </Form.Item>
                </FormSection>
                <Divider />
                <FormSection
                  title={L('商品图片', 'Images')}
                  description={L(
                    '首张为主图，建议 800×800 以上。',
                    'The first image is the cover; 800×800 or larger.',
                  )}
                >
                  <Form.Item
                    name="images"
                    valuePropName="fileList"
                    getValueFromEvent={fileListFrom}
                  >
                    <Upload
                      listType="picture-card"
                      accept="image/*"
                      multiple
                      beforeUpload={() => false}
                    >
                      <span className="tao-console-upload">
                        <ImagePlusIcon size={20} />
                        {L('上传', 'Upload')}
                      </span>
                    </Upload>
                  </Form.Item>
                </FormSection>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <FormSection
                  title={L('定价', 'Pricing')}
                  description={L(
                    '售价会按渠道同步。',
                    'Prices sync to every channel.',
                  )}
                >
                  <Form.Item
                    name="pricing"
                    label={L('计价方式', 'Pricing model')}
                  >
                    <RadioGroup
                      options={[
                        { label: L('固定价', 'Fixed'), value: 'fixed' },
                        { label: L('阶梯价', 'Tiered'), value: 'tiered' },
                        { label: L('会员价', 'Member'), value: 'member' },
                      ]}
                    />
                  </Form.Item>
                  <div className="tao-console-form-row tao-console-form-row--even">
                    <Form.Item
                      name="price"
                      label={L('售价', 'Price')}
                      rules={[
                        {
                          required: true,
                          message: L('请填写售价', 'Enter a price'),
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        prefix={currency}
                        styles={{ root: { width: '100%' } }}
                      />
                    </Form.Item>
                    <Form.Item name="cost" label={L('成本价', 'Cost')}>
                      <InputNumber
                        min={0}
                        prefix={currency}
                        styles={{ root: { width: '100%' } }}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="discount"
                    label={L('上新折扣', 'Launch discount')}
                  >
                    <Slider
                      max={50}
                      marks={{ 0: '0%', 10: '10%', 25: '25%', 50: '50%' }}
                      tooltip={{ formatter: (v) => `${v}%` }}
                    />
                  </Form.Item>
                </FormSection>
                <Divider />
                <FormSection title={L('渠道与库存', 'Channels & stock')}>
                  <Form.Item
                    name="channels"
                    label={L('销售渠道', 'Sales channels')}
                    rules={[
                      {
                        required: true,
                        message: L('至少选择一个渠道', 'Pick at least one'),
                      },
                    ]}
                  >
                    <CheckboxGroup
                      options={[
                        { label: L('官网', 'Website'), value: 'web' },
                        { label: L('小程序', 'Mobile app'), value: 'app' },
                        { label: L('线下门店', 'Retail'), value: 'store' },
                        { label: L('分销', 'Partners'), value: 'partner' },
                      ]}
                    />
                  </Form.Item>
                  <div className="tao-console-form-row tao-console-form-row--even">
                    <Form.Item name="stock" label={L('库存', 'Stock')}>
                      <InputNumber
                        min={0}
                        suffix={L('件', 'pcs')}
                        styles={{ root: { width: '100%' } }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="color"
                      label={L('主色', 'Colourway')}
                      getValueFromEvent={hexFrom}
                    >
                      <ColorPicker showText />
                    </Form.Item>
                  </div>
                </FormSection>
              </>
            ) : null}

            {step === 2 ? (
              <FormSection
                title={L('发布设置', 'Publishing')}
                description={L(
                  '选择上架时间并通知相关同事。',
                  'Choose when to go live and who to tell.',
                )}
              >
                <Form.Item name="publish" label={L('上架时间', 'Go live')}>
                  <RadioGroup
                    options={[
                      { label: L('立即上架', 'Now'), value: 'now' },
                      { label: L('定时上架', 'Scheduled'), value: 'scheduled' },
                      { label: L('仅保存', 'Save only'), value: 'draft' },
                    ]}
                  />
                </Form.Item>
                {values?.publish === 'scheduled' ? (
                  <div className="tao-console-form-row tao-console-form-row--even">
                    <Form.Item
                      name="date"
                      label={L('日期', 'Date')}
                      rules={[{ required: true }]}
                    >
                      <DatePicker minDate={today} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      name="time"
                      label={L('时间', 'Time')}
                      rules={[{ required: true }]}
                    >
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                ) : null}
                <Form.Item
                  name="notify"
                  label={L('通知同事', 'Notify teammates')}
                  extra={L('输入 @ 选择成员', 'Type @ to mention')}
                >
                  <Mentions
                    rows={2}
                    options={people[lang]
                      .slice(0, 6)
                      .map(([name]) => ({ value: name, label: name }))}
                    placeholder={L(
                      '@林知夏 新品上架，记得更新首页',
                      '@Maya Chen new product live, update the homepage',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  name="featured"
                  valuePropName="checked"
                  label={L('推荐到首页', 'Feature on homepage')}
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, v) =>
                        v
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(L('请先确认', 'Please confirm')),
                            ),
                    },
                  ]}
                >
                  <Checkbox>
                    {L(
                      '我确认商品信息真实，并遵守平台规则',
                      'I confirm the listing is accurate and follows platform rules',
                    )}
                  </Checkbox>
                </Form.Item>
              </FormSection>
            ) : null}

            <Affix offsetBottom={0}>
              <div className="tao-console-affix">
                <FormActions>
                  {step > 0 ? (
                    <Button
                      variant="ghost"
                      icon={<ArrowLeftIcon size={16} />}
                      onClick={() => setStep((s) => s - 1)}
                    >
                      {L('上一步', 'Back')}
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    icon={<SaveIcon size={16} />}
                    onClick={() =>
                      toast.success({ title: L('草稿已保存', 'Draft saved') })
                    }
                  >
                    {L('保存草稿', 'Save draft')}
                  </Button>
                  {step < 2 ? (
                    <Button icon={<ArrowRightIcon size={16} />} onClick={next}>
                      {L('下一步', 'Next')}
                    </Button>
                  ) : (
                    <Button type="submit" icon={<SendIcon size={16} />}>
                      {L('提交审核', 'Submit')}
                    </Button>
                  )}
                </FormActions>
              </div>
            </Affix>
          </Form>
        </Card>

        <aside className="tao-console-preview">
          <Badge.Ribbon
            text={values?.discount ? `-${values.discount}%` : L('新品', 'New')}
          >
            <Card
              cover={
                <Image
                  src={swatch(hueOf(values?.color ?? '#1677ff'))}
                  alt=""
                  preview={false}
                />
              }
            >
              <div className="tao-console-preview-body">
                <strong>{values?.name || L('商品名称', 'Product name')}</strong>
                <span>{values?.brand || 'Tao Studio'}</span>
                <span className="tao-console-preview-price">
                  {currency}
                  {Number(values?.price ?? 0).toFixed(2)}
                </span>
              </div>
            </Card>
          </Badge.Ribbon>
          <Card size="small" title={L('扫码预览', 'Scan to preview')}>
            <div className="tao-console-qr">
              <QRCode
                value="https://shop.tao.dev/p/20481"
                type="svg"
                size={112}
                bordered={false}
              />
              <span>
                {L(
                  '用手机扫码查看移动端效果',
                  'Open the mobile view on your phone',
                )}
              </span>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
