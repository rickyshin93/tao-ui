import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginApiDocgen } from '@rspress/plugin-api-docgen';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginWorkspaceDev } from 'rsbuild-plugin-workspace-dev';
import { componentDocs } from './src/docs/component-docs';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  base: process.env.RSPRESS_BASE ?? '/',
  siteOrigin: process.env.RSPRESS_SITE_ORIGIN ?? '',
  title: 'tao-ui',
  description:
    'React 18.2 and 19 components with machine-readable metadata, semantic DOM contracts, and predictable theming.',
  globalStyles: path.join(__dirname, 'styles/rspress.css'),
  globalUIComponents: [
    path.join(__dirname, 'docs/_components/preview-interaction-guard.tsx'),
    path.join(__dirname, 'docs/_components/discovery-head.tsx'),
  ],
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'tao-ui',
      description:
        'React 18.2 and 19 components with machine-readable metadata, semantic DOM contracts, and predictable theming.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'tao-ui',
      description:
        '支持 React 18.2 与 React 19 的组件库，提供机器可读元数据、语义化 DOM 契约与可预测主题。',
    },
  ],
  llms: true,
  webMcp: true,
  route: {
    exclude: ['superpowers/**/*'],
    localeRedirect: 'auto',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/rickyshin93/tao-ui',
      },
    ],
    search: true,
    darkMode: true,
    footer: {
      message: 'MIT · Rspress',
    },
  },
  builderConfig: {
    plugins: [
      pluginWorkspaceDev({
        startCurrent: true,
      }),
    ],
  },
  plugins: [
    pluginApiDocgen({
      entries: Object.fromEntries(
        componentDocs.map((component) => [
          component.name,
          `./${component.source}`,
        ]),
      ),
      apiParseTool: 'react-docgen-typescript',
    }),
    pluginPreview({
      iframeOptions: {
        devPort: 4175,
        customEntry: ({ demoPath }) => `
          import { createRoot } from 'react-dom/client';
          import Demo from ${JSON.stringify(demoPath)};
          import { IframeDemoRoot } from ${JSON.stringify(path.join(__dirname, 'docs/_components/iframe-demo-root.tsx'))};
          createRoot(document.getElementById('root')).render(<IframeDemoRoot><Demo /></IframeDemoRoot>);
        `,
        builderConfig: {
          // Keep the dev server's emitted iframe files separate from static previews.
          ...(process.env.NODE_ENV === 'development'
            ? {
                output: {
                  distPath: {
                    root: path.join(
                      __dirname,
                      'node_modules/.rspress/iframe-preview',
                    ),
                  },
                },
              }
            : {}),
          resolve: {
            alias: {
              '@rockshin/tao-ui': path.join(__dirname, 'src/index.tsx'),
              '@home-phone-demo': path.join(
                __dirname,
                'docs/_components/home-phone-demo.tsx',
              ),
            },
          },
        },
      },
    }),
  ],
});
