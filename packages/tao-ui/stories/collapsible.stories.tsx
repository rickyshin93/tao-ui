import { Collapsible } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '数据展示 Data Display/Collapsible',
};
export default meta;

const triggerStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--tao-color-border)',
  borderRadius: 'var(--tao-radius-md)',
  background: 'var(--tao-color-bg-container)',
};

const panelStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 12,
  border: '1px solid var(--tao-color-border-secondary)',
  borderRadius: 'var(--tao-radius-md)',
};

export const Basic: StoryObj = {
  render: () => (
    <Collapsible defaultOpen>
      <Collapsible.Trigger style={triggerStyle}>
        Toggle details
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div style={panelStyle}>
          Yes. Free to use for personal and commercial projects. No attribution
          required.
        </div>
      </Collapsible.Content>
    </Collapsible>
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ width: 320 }}>
        <div style={{ marginBottom: 8 }}>State: {open ? 'open' : 'closed'}</div>
        <Collapsible open={open} onOpenChange={setOpen}>
          <Collapsible.Trigger style={triggerStyle}>
            {open ? 'Hide' : 'Show'}
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div style={panelStyle}>Controlled from parent state.</div>
          </Collapsible.Content>
        </Collapsible>
      </div>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => (
    <Collapsible disabled>
      <Collapsible.Trigger style={triggerStyle}>
        Can't toggle
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div style={panelStyle}>You should never see this.</div>
      </Collapsible.Content>
    </Collapsible>
  ),
};

function Chevron() {
  return (
    <span data-tao-collapsible-chevron="">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

export const WithChevron: StoryObj = {
  name: 'Custom trigger + chevron',
  render: () => (
    <Collapsible defaultOpen>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            border: '1px solid var(--tao-color-border)',
            borderRadius: 'var(--tao-radius-md)',
            background: 'var(--tao-color-bg-container)',
            cursor: 'pointer',
            font: 'inherit',
            color: 'var(--tao-color-text)',
          }}
        >
          <span style={{ fontWeight: 500 }}>Order #4189</span>
          <Chevron />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div style={panelStyle}>
          <div>Status: Shipped</div>
          <div>Carrier: Tao Express</div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  ),
};
