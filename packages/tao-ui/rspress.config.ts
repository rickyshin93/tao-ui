import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginApiDocgen } from '@rspress/plugin-api-docgen';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginWorkspaceDev } from 'rsbuild-plugin-workspace-dev';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  base: process.env.RSPRESS_BASE ?? '/',
  siteOrigin: process.env.RSPRESS_SITE_ORIGIN ?? '',
  title: 'tao-ui',
  description:
    'AI-native React 19 components with machine-readable metadata, semantic DOM contracts, and predictable theming.',
  globalStyles: path.join(__dirname, 'styles/rspress.css'),
  globalUIComponents: [
    path.join(__dirname, 'docs/_components/preview-interaction-guard.tsx'),
  ],
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'tao-ui',
      description:
        'AI-native React 19 components with machine-readable metadata, semantic DOM contracts, and predictable theming.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'tao-ui',
      description:
        '面向人类与智能体的 React 19 组件库，提供机器可读元数据、语义化 DOM 契约与可预测主题。',
    },
  ],
  llms: true,
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
      entries: {
        alert: './src/components/alert/alert.tsx',
        breadcrumb: './src/components/breadcrumb/breadcrumb.tsx',
        button: './src/components/button/button.tsx',
        checkbox: './src/components/checkbox/checkbox.tsx',
        collapsible: './src/components/collapsible/collapsible.tsx',
        'context-menu': './src/components/context-menu/context-menu.tsx',
        'date-picker': './src/components/date-picker/date-picker.tsx',
        drawer: './src/components/drawer/drawer.tsx',
        dropdown: './src/components/dropdown/dropdown.tsx',
        form: './src/components/form/form.tsx',
        'form-actions': './src/components/form-actions/form-actions.tsx',
        'form-field': './src/components/form-field/form-field.tsx',
        'form-layout': './src/layouts/form-layout/form-layout.tsx',
        'form-section': './src/components/form-section/form-section.tsx',
        'headless-input-number': './src/number-input/number-input.tsx',
        input: './src/components/input/input.tsx',
        'input-number': './src/components/input-number/input-number.tsx',
        modal: './src/components/modal/modal.tsx',
        pagination: './src/components/pagination/pagination.tsx',
        popconfirm: './src/components/popconfirm/popconfirm.tsx',
        popover: './src/components/popover/popover.tsx',
        radio: './src/components/radio/radio.tsx',
        'range-picker': './src/components/date-picker/range-picker.tsx',
        'scroll-area': './src/components/scroll-area/scroll-area.tsx',
        select: './src/components/select/select.tsx',
        sonner: './src/components/sonner/sonner.tsx',
        spinner: './src/components/spinner/spinner.tsx',
        splitter: './src/components/splitter/splitter.tsx',
        stack: './src/layouts/stack/stack.tsx',
        steps: './src/components/steps/steps.tsx',
        switch: './src/components/switch/switch.tsx',
        table: './src/components/table/table.tsx',
        tabs: './src/components/tabs/tabs.tsx',
        tag: './src/components/tag/tag.tsx',
        'tao-provider': './src/provider/tao-provider.tsx',
        textarea: './src/components/textarea/textarea.tsx',
        tooltip: './src/components/tooltip/tooltip.tsx',
      },
      apiParseTool: 'react-docgen-typescript',
    }),
    pluginPreview(),
  ],
});
