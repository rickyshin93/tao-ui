import { ArrowRightIcon } from '@rockshin/tao-icons';
import { useLang } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';
import { Inventory } from './showcase/inventory';

export function ShowcaseGallery() {
  const zh = useLang() === 'zh';
  const prefix = zh ? '/zh' : '';
  return (
    <main className="tao-showcase tao-showcase-gallery">
      <header className="tao-showcase-head">
        <h1>{zh ? '用 tao-ui 构建的示例' : 'Built with tao-ui'}</h1>
        <p className="tao-showcase-lead">
          {zh
            ? '探索可交互的完整案例，看看组件如何组合成真实产品。'
            : 'Explore interactive examples and see how components come together in real products.'}
        </p>
      </header>
      <article className="tao-showcase-case">
        <div className="tao-showcase-case-preview" aria-hidden="true">
          <div className="tao-showcase-preview-side">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="tao-showcase-preview-main">
            <div className="tao-showcase-preview-bar">
              <i />
              <i />
            </div>
            <div className="tao-showcase-preview-content">
              <b />
              <span />
              <div className="tao-showcase-preview-stats">
                {['¥ 1.28M', '3,842', '¥ 334', '1.8%'].map((value) => (
                  <i key={value}>{value}</i>
                ))}
              </div>
              <div className="tao-showcase-preview-panels">
                <i className="tao-showcase-preview-chart" />
                <i className="tao-showcase-preview-channels" />
              </div>
            </div>
          </div>
        </div>
        <div className="tao-showcase-case-copy">
          <span className="tao-showcase-case-category">
            {zh ? '运营后台' : 'OPERATIONS'}
          </span>
          <h2>{zh ? '青禾商城' : 'Fieldnote Store'}</h2>
          <p>
            {zh
              ? '从订单、商品到团队与安全设置，体验完整的电商运营工作台。'
              : 'Explore a complete commerce workspace, from orders and products to team and security settings.'}
          </p>
          <Link
            className="tao-showcase-case-link"
            href={`${prefix}/showcase/commerce`}
          >
            {zh ? '查看示例' : 'Explore showcase'} <ArrowRightIcon size={16} />
          </Link>
        </div>
      </article>
      <Inventory zh={zh} prefix={prefix} />
    </main>
  );
}
