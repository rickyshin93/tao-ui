import { ContextMenu, type MenuItem } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '导航 Navigation/ContextMenu',
};
export default meta;

function Area({ children = 'Right-click here' }: { children?: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        width: 320,
        height: 160,
        border: '1px dashed var(--tao-color-border)',
        borderRadius: 8,
        color: 'var(--tao-color-text-tertiary)',
        fontSize: 13,
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}

export const Basic: StoryObj = {
  render: () => (
    <ContextMenu
      menu={{
        items: [
          { key: 'cut', label: 'Cut', extra: '⌘X' },
          { key: 'copy', label: 'Copy', extra: '⌘C' },
          { key: 'paste', label: 'Paste', extra: '⌘V' },
          { type: 'divider' },
          { key: 'delete', label: 'Delete', danger: true, extra: '⌫' },
        ],
        onClick: ({ key }) => alert(key),
      }}
    >
      <Area />
    </ContextMenu>
  ),
};

export const GroupsAndSubmenu: StoryObj = {
  name: 'Groups + Submenu',
  render: () => (
    <ContextMenu
      menu={{
        items: [
          {
            type: 'group',
            label: 'View',
            children: [
              { key: 'zoom-in', label: 'Zoom in' },
              { key: 'zoom-out', label: 'Zoom out' },
            ],
          },
          { type: 'divider' },
          {
            key: 'share',
            label: 'Share',
            children: [
              { key: 'mail', label: 'Email' },
              { key: 'link', label: 'Copy link' },
            ],
          },
          { key: 'rename', label: 'Rename' },
          { key: 'delete', label: 'Delete', danger: true },
        ],
      }}
    >
      <Area />
    </ContextMenu>
  ),
};

export const Selectable: StoryObj = {
  render: () => {
    const [checked, setChecked] = useState<string[]>(['grid']);
    return (
      <ContextMenu
        menu={{
          selectable: true,
          multiple: true,
          selectedKeys: checked,
          onSelect: ({ selectedKeys }) => setChecked(selectedKeys),
          items: [
            { key: 'grid', label: 'Show grid' },
            { key: 'ruler', label: 'Show ruler' },
            { key: 'guides', label: 'Show guides' },
          ],
        }}
      >
        <Area>{`Right-click — ${checked.length} shown`}</Area>
      </ContextMenu>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => (
    <ContextMenu
      menu={{
        items: [
          { key: 'undo', label: 'Undo', extra: '⌘Z' },
          { key: 'redo', label: 'Redo', disabled: true, extra: '⇧⌘Z' },
          { type: 'divider' },
          { key: 'select-all', label: 'Select all', extra: '⌘A' },
        ] as MenuItem[],
      }}
    >
      <Area />
    </ContextMenu>
  ),
};
