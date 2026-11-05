import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import { version } from '../package.json';

export * from '@rspress/core/theme-original';
export { HomePage as HomeHero } from '../docs/_components/home-page';
export { FallbackHeading } from './reference-heading';

export function Layout() {
  return (
    <OriginalLayout
      afterNavTitle={<span className="tao-site-version">v{version}</span>}
    />
  );
}
