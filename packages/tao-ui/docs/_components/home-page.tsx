import {
  Button,
  FormField,
  Input,
  Select,
  Switch,
  TaoProvider,
} from '@rockshin/tao-ui';
import { useDark, useFrontmatter, useLang } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';
import { useState } from 'react';
import { CopyButton } from './copy-button';

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}

export function HomePage() {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const { frontmatter } = useFrontmatter();
  const hero = frontmatter.hero!;
  const prefix = zh ? '/zh' : '';
  const [name, setName] = useState('Workspace');
  const [framework, setFramework] = useState<string | undefined>('react');
  const [notifications, setNotifications] = useState(true);
  const [applied, setApplied] = useState('');

  return (
    <main className="tao-home">
      <section className="tao-home-hero" aria-labelledby="tao-home-title">
        <div className="tao-home-intro">
          <h1 id="tao-home-title">{hero.text}</h1>
          <p className="tao-home-description">{hero.tagline}</p>
          <div className="tao-home-actions">
            {hero.actions?.map((action) => (
              <Link
                key={action.link}
                href={action.link}
                className={`tao-home-link tao-home-link--${action.theme}`}
              >
                {action.text}
                <Arrow />
              </Link>
            ))}
          </div>
          <div className="tao-install">
            <code>npm install @rockshin/tao-ui</code>
            <CopyButton
              text="npm install @rockshin/tao-ui"
              label={zh ? '复制' : 'Copy'}
            />
          </div>
          <p className="tao-home-support">
            React 18.2 / 19<span aria-hidden="true">·</span>TypeScript
            <span aria-hidden="true">·</span>MIT
          </p>
        </div>

        <div className="tao-showcase">
          <div className="tao-showcase-heading">
            <span>{zh ? '工作空间设置' : 'Workspace settings'}</span>
            <span className="tao-live-label">
              <span />
              {zh ? '交互示例' : 'Interactive demo'}
            </span>
          </div>
          <TaoProvider theme={{ mode: dark ? 'dark' : 'light' }}>
            <form
              className="tao-showcase-form"
              onSubmit={(event) => {
                event.preventDefault();
                setApplied(
                  zh
                    ? `当前示例：${name} · ${framework ?? '—'} · 通知${notifications ? '开启' : '关闭'}`
                    : `Current demo: ${name} · ${framework ?? '—'} · notifications ${notifications ? 'on' : 'off'}`,
                );
              }}
            >
              <FormField label={zh ? '空间名称' : 'Workspace name'}>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </FormField>
              <FormField label={zh ? '前端框架' : 'Framework'}>
                <Select
                  value={framework}
                  onChange={(value) => setFramework(value as string)}
                  showSearch
                  options={[
                    { label: 'React', value: 'react' },
                    { label: 'Next.js', value: 'nextjs' },
                    { label: 'Remix', value: 'remix' },
                  ]}
                />
              </FormField>
              <div className="tao-showcase-switch">
                <div>
                  <label
                    id="tao-notifications-label"
                    htmlFor="tao-notifications"
                  >
                    {zh ? '邮件通知' : 'Email notifications'}
                  </label>
                  <p>
                    {zh
                      ? '接收工作空间的最新动态'
                      : 'Keep up with your workspace'}
                  </p>
                </div>
                <Switch
                  id="tao-notifications"
                  aria-labelledby="tao-notifications-label"
                  checked={notifications}
                  onChange={setNotifications}
                />
              </div>
              <div className="tao-showcase-buttons">
                <Button type="submit">
                  {zh ? '应用设置' : 'Apply settings'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setName('Workspace');
                    setFramework('react');
                    setNotifications(true);
                    setApplied('');
                  }}
                >
                  {zh ? '重置' : 'Reset'}
                </Button>
              </div>
              <p className="tao-showcase-result" role="status">
                {applied ||
                  (zh
                    ? '直接试用组件，所有更改仅在当前示例中生效。'
                    : 'Try the components. Changes apply to this demo only.')}
              </p>
            </form>
          </TaoProvider>
          <div className="tao-showcase-footer">
            <code>Input + Select + Switch + Button</code>
          </div>
        </div>
      </section>

      <section
        className="tao-home-components"
        aria-labelledby="tao-components-title"
      >
        <div className="tao-section-heading">
          <h2 id="tao-components-title">
            {zh ? '从一个组件开始' : 'Start with a component'}
          </h2>
          <p>
            {zh
              ? '试效果，读代码，然后用在你的产品里。'
              : 'Try it, read the code, make it yours.'}
          </p>
        </div>
        <div className="tao-home-component-links">
          <Link
            href={`${prefix}/components/button`}
            className="tao-component-link"
          >
            <div>
              <h3>
                Button<span>{zh ? '按钮' : 'Actions'}</span>
              </h3>
              <p>
                {zh
                  ? '清晰的操作层级，完整的加载与禁用状态。'
                  : 'Clear action hierarchy, with loading and disabled states.'}
              </p>
            </div>
            <Arrow />
          </Link>
          <Link
            href={`${prefix}/components/select`}
            className="tao-component-link"
          >
            <div>
              <h3>
                Select<span>{zh ? '选择器' : 'Choices'}</span>
              </h3>
              <p>
                {zh
                  ? '搜索、单选与多选，让每一次选择更顺手。'
                  : 'Search, single and multiple selection, ready to use.'}
              </p>
            </div>
            <Arrow />
          </Link>
        </div>
      </section>

      <section
        className="tao-home-principles"
        aria-label={zh ? '组件库特性' : 'Library features'}
      >
        <div>
          <h2>{zh ? '一套主题，保持一致' : 'One theme, a consistent UI'}</h2>
          <p>
            {zh
              ? '通过 TaoProvider 统一颜色、尺寸与深浅色，组件自动继承。'
              : 'Set colors, sizes and appearance with TaoProvider. Components inherit the rest.'}
          </p>
        </div>
        <div>
          <h2>{zh ? '定制有稳定的入口' : 'Customization with a contract'}</h2>
          <p>
            {zh
              ? '使用类型化的 classNames 与 styles，直接定位需要定制的语义部件。'
              : 'Use typed classNames and styles to target the semantic parts you need.'}
          </p>
        </div>
        <div>
          <h2>{zh ? '人和智能体都能读懂' : 'Readable by people and agents'}</h2>
          <p>
            {zh
              ? '可运行示例与 API 文档，配合 llms.txt 和组件元数据，服务不同的开发方式。'
              : 'Runnable examples and API docs, alongside llms.txt and component metadata.'}
          </p>
        </div>
      </section>
    </main>
  );
}
