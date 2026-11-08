import {
  ChartColumnIcon,
  CoinsIcon,
  FileTextIcon,
  RefreshCwIcon,
  TrophyIcon,
  UsersIcon,
} from '@rockshin/tao-icons';
import {
  Button,
  Card,
  Masonry,
  Progress,
  Result,
  Skeleton,
  Spinner,
  Tag,
  toast,
} from '@rockshin/tao-ui';
import { useEffect, useState } from 'react';
import { type IconType, PageTitle, useL } from './shared';

export function FinancePage({ onBack }: { onBack: () => void }) {
  const L = useL();
  return (
    <Card>
      <Result
        status="403"
        title={L('需要财务权限', 'Finance access required')}
        subTitle={L(
          '这一页只对管理员和财务角色开放，可以向工作区所有者申请。',
          'Only admins and finance roles can open this page. Ask the workspace owner for access.',
        )}
        extra={
          <>
            <Button variant="secondary" onClick={onBack}>
              {L('返回概览', 'Back to overview')}
            </Button>
            <Button
              onClick={() =>
                toast.success({ title: L('申请已发送', 'Request sent') })
              }
            >
              {L('申请权限', 'Request access')}
            </Button>
          </>
        }
      />
    </Card>
  );
}

export function ReportsPage() {
  const L = useL();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const reports: {
    key: string;
    icon: IconType;
    title: string;
    body: string;
    tag: string;
    progress?: number;
    rows: number;
  }[] = [
    {
      key: 'sales',
      icon: ChartColumnIcon,
      title: L('月度销售', 'Monthly sales'),
      body: L(
        '营收同比 +12.4%，官网贡献最大。',
        'Revenue +12.4% YoY, led by the website.',
      ),
      tag: L('每月', 'Monthly'),
      rows: 3,
    },
    {
      key: 'cohort',
      icon: UsersIcon,
      title: L('客户留存', 'Customer retention'),
      body: L('90 天复购率 38%。', '38% repeat within 90 days.'),
      tag: L('每周', 'Weekly'),
      progress: 38,
      rows: 2,
    },
    {
      key: 'margin',
      icon: CoinsIcon,
      title: L('毛利分析', 'Margin'),
      body: L(
        '礼盒类毛利最高，帆布包库存周转偏慢，建议下月减少备货。',
        'Gift sets carry the best margin; canvas totes turn slowly, consider a smaller reorder.',
      ),
      tag: L('每月', 'Monthly'),
      rows: 4,
    },
    {
      key: 'top',
      icon: TrophyIcon,
      title: L('热销榜', 'Top sellers'),
      body: L(
        '手冲咖啡礼盒连续 3 周第一。',
        'Pour-over gift set #1 for 3 weeks.',
      ),
      tag: L('每日', 'Daily'),
      progress: 92,
      rows: 2,
    },
    {
      key: 'tax',
      icon: FileTextIcon,
      title: L('税务报表', 'Tax summary'),
      body: L(
        '第四季度报表将在 12 月 5 日生成。',
        'Q4 report generates on Dec 5.',
      ),
      tag: L('季度', 'Quarterly'),
      rows: 2,
    },
  ];

  return (
    <>
      <PageTitle
        title={L('报表', 'Reports')}
        sub={L(
          '瀑布流布局，加载中显示骨架屏',
          'Masonry layout with skeletons while loading',
        )}
      >
        <Button
          variant="secondary"
          icon={<RefreshCwIcon size={16} />}
          onClick={() => setLoading(true)}
        >
          {L('刷新', 'Refresh')}
        </Button>
      </PageTitle>
      <Spinner
        spinning={loading}
        tip={L('正在汇总数据…', 'Crunching numbers…')}
      >
        <Masonry
          columns={3}
          gutter={16}
          items={reports.map((r) => ({ key: r.key, data: r }))}
          itemRender={({ data: r }) => (
            <Card>
              <Skeleton loading={loading} active paragraph={{ rows: r.rows }}>
                <div className="tao-console-report">
                  <div className="tao-console-kpi-head">
                    <span className="tao-console-chip">
                      <r.icon size={18} />
                    </span>
                    <Tag>{r.tag}</Tag>
                  </div>
                  <strong>{r.title}</strong>
                  <p>{r.body}</p>
                  {r.progress !== undefined ? (
                    <Progress percent={r.progress} size="small" />
                  ) : null}
                </div>
              </Skeleton>
            </Card>
          )}
        />
      </Spinner>
    </>
  );
}
