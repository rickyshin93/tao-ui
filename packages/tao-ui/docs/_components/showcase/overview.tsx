import {
  ArrowUpRightIcon,
  GiftIcon,
  MegaphoneIcon,
  RocketIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from '@rockshin/tao-icons';
import {
  Button,
  Calendar,
  Card,
  Carousel,
  Progress,
  ScrollArea,
  Segmented,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
} from '@rockshin/tao-ui';
import { type CSSProperties, useId, useState } from 'react';

import {
  type Copy,
  type IconType,
  people,
  series,
  today,
  useL,
} from './shared';

type Lang = 'zh' | 'en';

export function OverviewPage({ t, lang }: { t: Copy; lang: Lang }) {
  const L = useL();
  const name = people[lang][0][0];
  const money = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: lang === 'zh' ? 'CNY' : 'USD',
    maximumFractionDigits: 0,
  });
  const cur = lang === 'zh' ? '¥' : '$';

  return (
    <div className="tao-console-overview">
      <header className="tao-console-hello">
        <div>
          <p className="tao-console-eyebrow">
            {today.format('YYYY.MM.DD')} · {L('经营日报', 'Daily brief')}
          </p>
          <h2>{L(`早上好，${name}`, `Good morning, ${name}`)}</h2>
          <p className="tao-console-lead">
            {L('这是今天的经营情况。', 'Here is today at a glance.')}
          </p>
        </div>
        <div className="tao-console-countdown">
          <span className="tao-console-eyebrow">
            {L('双十二大促', 'Holiday sale')}
          </span>
          <Statistic.Countdown
            value={today.add(33, 'day').startOf('day').valueOf()}
            format={L('D 天 HH:mm:ss', 'D[d] HH:mm:ss')}
          />
        </div>
      </header>

      <section className="tao-console-lede">
        <RevenueSheet t={t} money={money} lang={lang} cur={cur} />
        <ChannelCard t={t} money={money} lang={lang} />
      </section>

      <section className="tao-console-row tao-console-row--three">
        <Card className="tao-console-news">
          <p className="tao-console-eyebrow">{L('公告', 'Announcements')}</p>
          <Carousel autoplay={{ dotDuration: true }} dotPlacement="bottom">
            {(
              [
                [
                  RocketIcon,
                  L('新版商品编辑器上线', 'New product editor is live'),
                  L(
                    '支持分步填写、定时上架和团队 @ 通知。',
                    'Step-by-step forms, scheduled publishing and @mentions.',
                  ),
                ],
                [
                  GiftIcon,
                  L('双十二活动报名开启', 'Holiday campaign sign-ups open'),
                  L(
                    '11 月 20 日前提交报名可获得首页推荐位。',
                    'Sign up before Nov 20 for a homepage slot.',
                  ),
                ],
                [
                  MegaphoneIcon,
                  L('结算周期调整', 'Payout schedule update'),
                  L(
                    '自 12 月起改为每周结算一次。',
                    'Payouts move to weekly from December.',
                  ),
                ],
              ] as [IconType, string, string][]
            ).map(([Icon, title, body]) => (
              <div key={title}>
                <div className="tao-console-slide">
                  <Icon size={22} />
                  <strong>{title}</strong>
                  <p>{body}</p>
                  <Button variant="secondary" size="small">
                    {L('了解更多', 'Learn more')}
                    <ArrowUpRightIcon size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </Carousel>
        </Card>
        <Card title={L('日程', 'Schedule')} className="tao-console-calendar">
          <Calendar
            fullscreen={false}
            defaultValue={today}
            cellRender={(date, info) =>
              info.type === 'date' &&
              [3, 11, 12, 20].includes(date.date()) &&
              date.month() === today.month() ? (
                <span className="tao-console-cal-dot" />
              ) : null
            }
          />
        </Card>
        <Card title={L('动态', 'Activity')}>
          <ScrollArea maxHeight={300} scrollShadow>
            <Timeline
              items={people[lang].slice(0, 8).map(([who], i) => ({
                key: who,
                color: i === 0 ? 'blue' : 'gray',
                title: today.subtract(i * 47, 'minute').format('HH:mm'),
                content: [
                  L(`${who} 下单 ¥1,280`, `${who} placed an order of $182`),
                  L(`${who} 发起退款`, `${who} requested a refund`),
                  L(`${who} 留下 5 星评价`, `${who} left a 5-star review`),
                  L(`${who} 注册成为会员`, `${who} joined as a member`),
                ][i % 4],
              }))}
            />
          </ScrollArea>
        </Card>
      </section>
    </div>
  );
}

/* ---------- revenue hero: big figure + area chart + ruled KPI strip ---------- */

const rangeDelta = [6.8, 12.4, 31.2];

function RevenueSheet({
  t,
  money,
  lang,
  cur,
}: {
  t: Copy;
  money: Intl.NumberFormat;
  lang: Lang;
  cur: string;
}) {
  const [range, setRange] = useState(1);
  const data = series[range];
  const label = (i: number) =>
    range === 2
      ? today.subtract(11 - i, 'month').format(lang === 'zh' ? 'M月' : 'MMM')
      : today
          .subtract(data.length - 1 - i, 'day')
          .format(range === 0 ? 'ddd' : 'M/D');
  const total = data.reduce((a, b) => a + b, 0) * 1000;
  const [whole, frac] = splitMoney(money.format(total), cur);

  return (
    <Card className="tao-console-sheet">
      <div className="tao-console-sheet-head">
        <div>
          <p className="tao-console-eyebrow">
            {t.kpi[0]} · {t.ranges[range]}
          </p>
          <div className="tao-console-hero-num">
            <span>{cur}</span>
            {whole}
            {frac}
          </div>
          <Delta value={rangeDelta[range]} note={t.vsLast} />
        </div>
        <Segmented
          size="small"
          value={range}
          onChange={(v) => setRange(Number(v))}
          options={t.ranges.map((r, i) => ({ label: r, value: i }))}
        />
      </div>

      <AreaChart
        key={range}
        data={data}
        label={label}
        format={(v) => money.format(v * 1000)}
        tick={range === 1 ? 5 : 1}
      />

      <dl className="tao-console-strip">
        <StripCell title={t.kpi[1]} value={3842} delta={8.1} />
        <StripCell
          title={t.kpi[2]}
          value={lang === 'zh' ? 334.35 : 47.48}
          precision={2}
          prefix={cur}
          delta={-2.3}
        />
        <StripCell
          title={t.kpi[3]}
          value={1.8}
          precision={1}
          suffix="%"
          delta={-0.4}
          invert
        />
      </dl>
    </Card>
  );
}

/** "¥1,560,000" → ["1,560,000", ""]; keeps the symbol out so it can be set small. */
function splitMoney(s: string, cur: string): [string, string] {
  const body = s
    .replace(cur, '')
    .replace(/^CN|^US/, '')
    .trim();
  const dot = body.indexOf('.');
  return dot < 0 ? [body, ''] : [body.slice(0, dot), body.slice(dot)];
}

function Delta({
  value,
  note,
  invert,
}: {
  value: number;
  note?: string;
  invert?: boolean;
}) {
  const good = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? TrendingUpIcon : TrendingDownIcon;
  return (
    <span className="tao-console-delta">
      <Tag
        color={good ? 'success' : 'error'}
        variant="filled"
        icon={<Icon size={12} />}
      >
        {value > 0 ? '+' : ''}
        {value}%
      </Tag>
      {note ? <span>{note}</span> : null}
    </span>
  );
}

function StripCell({
  title,
  delta,
  invert,
  ...num
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  delta: number;
  invert?: boolean;
}) {
  return (
    <div className="tao-console-strip-cell">
      <dt>{title}</dt>
      <dd>
        <Statistic {...num} />
        <Delta value={delta} invert={invert} />
      </dd>
    </div>
  );
}

/** Catmull-Rom through the points, emitted as cubic Béziers. */
function smoothPath(p: [number, number][]) {
  const f = (n: number) => n.toFixed(2);
  return p.reduce((d, [x, y], i) => {
    if (i === 0) return `M${f(x)},${f(y)}`;
    const a = p[i - 2] ?? p[i - 1];
    const b = p[i - 1];
    const c = p[i + 1] ?? p[i];
    return `${d} C${f(b[0] + (x - a[0]) / 6)},${f(b[1] + (y - a[1]) / 6)} ${f(
      x - (c[0] - b[0]) / 6,
    )},${f(y - (c[1] - b[1]) / 6)} ${f(x)},${f(y)}`;
  }, '');
}

function AreaChart({
  data,
  label,
  format,
  tick,
}: {
  data: number[];
  label: (i: number) => string;
  format: (v: number) => string;
  tick: number;
}) {
  const gid = `tao-area-${useId().replace(/:/g, '')}`;
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const lo = min - (max - min) * 0.6;
  const hi = max + (max - min) * 0.08;
  const last = data.length - 1;
  const pts = data.map(
    (v, i) =>
      [(i / last) * 100, 100 - ((v - lo) / (hi - lo)) * 100] as [
        number,
        number,
      ],
  );
  const line = smoothPath(pts);
  const at = active ?? last;
  const w = 100 / last;

  return (
    <div className="tao-console-area">
      <div className="tao-console-area-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L100,100 L0,100 Z`} fill={`url(#${gid})`} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="tao-console-area-rule"
          style={{ left: `${pts[at][0]}%` }}
        />
        <span
          className="tao-console-area-dot"
          data-idle={active === null || undefined}
          style={
            { left: `${pts[at][0]}%`, top: `${pts[at][1]}%` } as CSSProperties
          }
        />
        <div className="tao-console-area-hit">
          {data.map((v, i) => (
            <Tooltip key={label(i)} title={`${label(i)} · ${format(v)}`}>
              <button
                type="button"
                aria-label={`${label(i)} ${format(v)}`}
                style={{ left: `${(i - 0.5) * w}%`, width: `${w}%` }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="tao-console-axis">
        {data.map((_, i) =>
          i % tick === 0 || i === last ? (
            <span
              key={label(i)}
              data-edge={i === 0 ? 'start' : i === last ? 'end' : undefined}
              data-minor={
                (i !== last && ((i / tick) % 2 === 1 || last - i < tick * 2)) ||
                undefined
              }
              style={{ left: `${(i / last) * 100}%` }}
            >
              {label(i)}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

/* ---------- channel mix: one segmented bar + ledger ---------- */

const channelMix = [46, 28, 16, 10];
const channelTone = [100, 62, 36, 18];

function ChannelCard({
  t,
  money,
  lang,
}: {
  t: Copy;
  money: Intl.NumberFormat;
  lang: Lang;
}) {
  const month = lang === 'zh' ? 1284560 : 182430;
  const tone = (i: number) =>
    ({ '--mix': `${channelTone[i]}%` }) as CSSProperties;
  return (
    <Card className="tao-console-mixcard">
      <p className="tao-console-eyebrow">{t.channels}</p>
      <div className="tao-console-mix" role="img" aria-label={t.channels}>
        {channelMix.map((pct, i) => (
          <span key={t.channelNames[i]} style={{ ...tone(i), flexGrow: pct }} />
        ))}
      </div>
      <ul className="tao-console-ledger">
        {channelMix.map((pct, i) => (
          <li key={t.channelNames[i]}>
            <i style={tone(i)} />
            <span>{t.channelNames[i]}</span>
            <span className="tao-console-num">
              {money.format((month * pct) / 100)}
            </span>
            <b className="tao-console-num">{pct}%</b>
          </li>
        ))}
      </ul>
      <div className="tao-console-goal">
        <span className="tao-console-eyebrow">{t.target}</span>
        <div className="tao-console-goal-num">
          <strong>80%</strong>
          <span>{t.targetDone}</span>
        </div>
        <Progress percent={80} showInfo={false} size="small" />
      </div>
    </Card>
  );
}
