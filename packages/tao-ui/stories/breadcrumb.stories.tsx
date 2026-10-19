import { Breadcrumb, Stack, TaoProvider } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '导航 Navigation/Breadcrumb',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        { title: 'Components', href: '/components' },
        { title: 'Breadcrumb' },
      ]}
    />
  ),
};

export const WithClicks: StoryObj = {
  name: 'Click Handlers',
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Dashboard', onClick: () => alert('Dashboard') },
        { title: 'Projects', onClick: () => alert('Projects') },
        { title: 'Detail' },
      ]}
    />
  ),
};

export const CustomSeparator: StoryObj = {
  name: 'Custom Separator',
  render: () => (
    <Stack gap="md">
      <Breadcrumb
        separator="/"
        items={[
          { title: 'Home', href: '/' },
          { title: 'Docs', href: '/docs' },
          { title: 'Guide' },
        ]}
      />
      <Breadcrumb
        separator="›"
        items={[
          { title: 'Home', href: '/' },
          { title: 'Settings', href: '/settings' },
          { title: 'Profile' },
        ]}
      />
    </Stack>
  ),
};

export const Collapsed: StoryObj = {
  name: 'Collapsed (maxItems)',
  render: () => (
    <Breadcrumb
      maxItems={3}
      items={[
        { title: 'Home', href: '/' },
        { title: 'Group', href: '/group' },
        { title: 'Section', href: '/section' },
        { title: 'Subsection', href: '/subsection' },
        { title: 'Current Page' },
      ]}
    />
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        { title: 'Archived', href: '/archived', disabled: true },
        { title: 'Item' },
      ]}
    />
  ),
};

export const CustomLink: StoryObj = {
  name: 'Custom Link (itemRender + Slot)',
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Home', key: 'home' },
        { title: 'Library', key: 'library' },
        { title: 'Data' },
      ]}
      itemRender={(item, { isLast }) =>
        isLast ? (
          item.title
        ) : (
          // Any custom element works — e.g. a router <Link>. Slot merges the
          // breadcrumb link styles onto it instead of adding another <a>.
          <a href={`#${String(item.key)}`}>{item.title}</a>
        )
      }
    />
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Stack gap="md">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size}>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{size}</p>
          <TaoProvider size={size}>
            <Breadcrumb
              items={[
                { title: 'Home', href: '/' },
                { title: 'List', href: '/list' },
                { title: 'Detail' },
              ]}
            />
          </TaoProvider>
        </div>
      ))}
    </Stack>
  ),
};
