import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import { version } from '../package.json';
import { BrandLogo } from './brand-logo';

export * from '@rspress/core/theme-original';
export { HomePage as HomeHero } from '../docs/_components/home-page';
export { FallbackHeading } from './reference-heading';

export function Layout() {
  return (
    <OriginalLayout
      navTitle={<BrandLogo />}
      afterNavTitle={<span className="tao-site-version">v{version}</span>}
    />
  );
}
