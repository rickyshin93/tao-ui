import { Button, Dropdown, type MenuItem, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '导航 Navigation/Dropdown',
};
export default meta;

const basicItems: MenuItem[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'billing', label: 'Billing' },
  { key: 'settings', label: 'Settings' },
];

export const Basic: StoryObj = {
  render: () => (
    <Dropdown menu={{ items: basicItems, onClick: ({ key }) => alert(key) }}>
      <Button variant="secondary">Open menu</Button>
    </Dropdown>
  ),
};

export const WithIconsAndShortcuts: StoryObj = {
  name: 'Icons + Shortcuts',
  render: () => (
    <Dropdown
      menu={{
        items: [
          { key: 'new', label: 'New file', icon: <FileIcon />, extra: '⌘N' },
          { key: 'copy', label: 'Copy', icon: <CopyIcon />, extra: '⌘C' },
          {
            key: 'paste',
            label: 'Paste',
            icon: <ClipboardIcon />,
            extra: '⌘V',
            disabled: true,
          },
        ],
      }}
    >
      <Button variant="secondary">Actions</Button>
    </Dropdown>
  ),
};

export const DividerAndGroup: StoryObj = {
  name: 'Divider + Group',
  render: () => (
    <Dropdown
      menu={{
        items: [
          {
            type: 'group',
            label: 'Account',
            children: [
              { key: 'profile', label: 'Profile' },
              { key: 'billing', label: 'Billing' },
            ],
          },
          { type: 'divider' },
          {
            type: 'group',
            label: 'Workspace',
            children: [
              { key: 'members', label: 'Members' },
              { key: 'settings', label: 'Settings' },
            ],
          },
          { type: 'divider' },
          { key: 'logout', label: 'Log out', danger: true },
        ],
      }}
    >
      <Button variant="secondary">Account</Button>
    </Dropdown>
  ),
};

export const Submenu: StoryObj = {
  render: () => (
    <Dropdown
      menu={{
        items: [
          { key: 'back', label: 'Back' },
          { key: 'forward', label: 'Forward', disabled: true },
          { type: 'divider' },
          {
            key: 'share',
            label: 'Share',
            children: [
              { key: 'mail', label: 'Email' },
              { key: 'message', label: 'Message' },
              { type: 'divider' } as MenuItem,
              {
                key: 'more',
                label: 'More',
                children: [
                  { key: 'twitter', label: 'Twitter' },
                  { key: 'facebook', label: 'Facebook' },
                ],
              },
            ],
          },
          { key: 'delete', label: 'Delete', danger: true, extra: '⌫' },
        ],
      }}
    >
      <Button variant="secondary">Right menu</Button>
    </Dropdown>
  ),
};

export const Selectable: StoryObj = {
  name: 'Selectable (single + multiple)',
  render: () => {
    const [single, setSingle] = useState<string[]>(['md']);
    const [multi, setMulti] = useState<string[]>(['bold']);
    return (
      <Stack direction="horizontal" gap="lg">
        <Dropdown
          menu={{
            selectable: true,
            selectedKeys: single,
            onSelect: ({ selectedKeys }) => setSingle(selectedKeys),
            items: [
              { key: 'sm', label: 'Small' },
              { key: 'md', label: 'Medium' },
              { key: 'lg', label: 'Large' },
            ],
          }}
        >
          <Button variant="secondary">Size: {single[0]}</Button>
        </Dropdown>

        <Dropdown
          menu={{
            selectable: true,
            multiple: true,
            selectedKeys: multi,
            onSelect: ({ selectedKeys }) => setMulti(selectedKeys),
            items: [
              { key: 'bold', label: 'Bold' },
              { key: 'italic', label: 'Italic' },
              { key: 'underline', label: 'Underline' },
            ],
          }}
        >
          <Button variant="secondary">Format ({multi.length})</Button>
        </Dropdown>
      </Stack>
    );
  },
};

export const Placement: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gap: 12,
        width: 'fit-content',
      }}
    >
      {(
        [
          'topLeft',
          'top',
          'topRight',
          'bottomLeft',
          'bottom',
          'bottomRight',
        ] as const
      ).map((p) => (
        <Dropdown key={p} placement={p} menu={{ items: basicItems }}>
          <Button variant="secondary">{p}</Button>
        </Dropdown>
      ))}
    </div>
  ),
};

export const Trigger: StoryObj = {
  name: 'Trigger: hover / click',
  render: () => (
    <Stack direction="horizontal" gap="lg">
      <Dropdown trigger={['hover']} menu={{ items: basicItems }}>
        <Button variant="secondary">Hover me</Button>
      </Dropdown>
      <Dropdown trigger={['click']} arrow menu={{ items: basicItems }}>
        <Button variant="secondary">Click (with arrow)</Button>
      </Dropdown>
    </Stack>
  ),
};

export const SplitButton: StoryObj = {
  name: 'Dropdown.Button',
  render: () => (
    <Dropdown.Button
      onClick={() => alert('primary action')}
      menu={{ items: basicItems, onClick: ({ key }) => alert(key) }}
    >
      Save
    </Dropdown.Button>
  ),
};

// ---- demo icons ----
function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
