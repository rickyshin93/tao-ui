import { CheckableTag, Stack, Tag } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '数据展示 Data Display/Tag',
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm">
      <Tag>Default</Tag>
      <Tag color="primary">Primary</Tag>
      <Tag color="success">Success</Tag>
      <Tag color="warning">Warning</Tag>
      <Tag color="error">Error</Tag>
    </Stack>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <Stack gap="md">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          filled (default)
        </p>
        <Stack direction="horizontal" gap="sm">
          <Tag variant="filled">Default</Tag>
          <Tag variant="filled" color="primary">
            Primary
          </Tag>
          <Tag variant="filled" color="success">
            Success
          </Tag>
          <Tag variant="filled" color="warning">
            Warning
          </Tag>
          <Tag variant="filled" color="error">
            Error
          </Tag>
        </Stack>
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>solid</p>
        <Stack direction="horizontal" gap="sm">
          <Tag variant="solid">Default</Tag>
          <Tag variant="solid" color="primary">
            Primary
          </Tag>
          <Tag variant="solid" color="success">
            Success
          </Tag>
          <Tag variant="solid" color="warning">
            Warning
          </Tag>
          <Tag variant="solid" color="error">
            Error
          </Tag>
        </Stack>
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>outlined</p>
        <Stack direction="horizontal" gap="sm">
          <Tag variant="outlined">Default</Tag>
          <Tag variant="outlined" color="primary">
            Primary
          </Tag>
          <Tag variant="outlined" color="success">
            Success
          </Tag>
          <Tag variant="outlined" color="warning">
            Warning
          </Tag>
          <Tag variant="outlined" color="error">
            Error
          </Tag>
        </Stack>
      </div>
    </Stack>
  ),
};

export const CustomColor: StoryObj = {
  name: 'Custom Colors',
  render: () => (
    <Stack gap="md">
      <Stack direction="horizontal" gap="sm">
        <Tag color="#6366f1">Indigo</Tag>
        <Tag color="#ec4899">Pink</Tag>
        <Tag color="#14b8a6">Teal</Tag>
        <Tag color="#f97316">Orange</Tag>
        <Tag color="#8b5cf6">Violet</Tag>
      </Stack>
      <Stack direction="horizontal" gap="sm">
        <Tag color="#6366f1" variant="solid">
          Indigo
        </Tag>
        <Tag color="#ec4899" variant="solid">
          Pink
        </Tag>
        <Tag color="#14b8a6" variant="solid">
          Teal
        </Tag>
        <Tag color="#f97316" variant="solid">
          Orange
        </Tag>
        <Tag color="#8b5cf6" variant="solid">
          Violet
        </Tag>
      </Stack>
      <Stack direction="horizontal" gap="sm">
        <Tag color="#6366f1" variant="outlined">
          Indigo
        </Tag>
        <Tag color="#ec4899" variant="outlined">
          Pink
        </Tag>
        <Tag color="#14b8a6" variant="outlined">
          Teal
        </Tag>
        <Tag color="#f97316" variant="outlined">
          Orange
        </Tag>
        <Tag color="#8b5cf6" variant="outlined">
          Violet
        </Tag>
      </Stack>
    </Stack>
  ),
};

export const WithIcon: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm">
      <Tag icon={<span>🔥</span>} color="error">
        Hot
      </Tag>
      <Tag icon={<span>✅</span>} color="success">
        Done
      </Tag>
      <Tag icon={<span>⚡</span>} color="warning">
        Fast
      </Tag>
      <Tag icon={<span>🏷️</span>}>Label</Tag>
    </Stack>
  ),
};

export const Closable: StoryObj = {
  render: () => {
    function Demo() {
      const [tags, setTags] = useState(['React', 'Vue', 'Angular', 'Svelte']);
      return (
        <Stack direction="horizontal" gap="sm">
          {tags.map((t) => (
            <Tag
              key={t}
              onClose={() => setTags((prev) => prev.filter((x) => x !== t))}
              color="primary"
            >
              {t}
            </Tag>
          ))}
          {tags.length === 0 && (
            <span style={{ color: '#888', fontSize: 13 }}>
              All removed. Refresh to reset.
            </span>
          )}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Checkable: StoryObj = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<string[]>(['react']);
      const options = ['react', 'vue', 'angular', 'svelte', 'solid'];
      return (
        <Stack direction="horizontal" gap="sm">
          {options.map((opt) => (
            <CheckableTag
              key={opt}
              checked={selected.includes(opt)}
              onChange={(checked) =>
                setSelected((prev) =>
                  checked ? [...prev, opt] : prev.filter((x) => x !== opt),
                )
              }
            >
              {opt}
            </CheckableTag>
          ))}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Disabled: StoryObj = {
  render: () => (
    <Stack direction="horizontal" gap="sm">
      <Tag disabled>Disabled</Tag>
      <Tag disabled color="primary" variant="solid">
        Disabled Solid
      </Tag>
      <Tag disabled onClose={() => {}}>
        Can't Close
      </Tag>
      <CheckableTag disabled>Can't Check</CheckableTag>
    </Stack>
  ),
};
