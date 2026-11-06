import { useLang, useSite, withBase } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';

export function BrandLogo() {
  const lang = useLang();
  const { site } = useSite();
  const artwork = withBase('/brand/tao-ui.svg');

  return (
    <div className="rp-nav__title">
      <Link
        href={lang === site.lang ? '/' : `/${lang}/`}
        className="rp-nav__title__link tao-brand"
        aria-label={lang === 'zh' ? 'tao-ui 首页' : 'tao-ui home'}
      >
        <svg viewBox="-1 -1 578 134" aria-hidden="true" focusable="false">
          <g className="tao-brand-mark">
            <use href={`${artwork}#tao-cap`} />
            <use href={`${artwork}#tao-corner`} />
            <use href={`${artwork}#tao-stem`} className="tao-brand-stem" />
            <use href={`${artwork}#tao-foot`} className="tao-brand-foot" />
          </g>
          <use href={`${artwork}#tao-wordmark`} />
        </svg>
      </Link>
    </div>
  );
}
