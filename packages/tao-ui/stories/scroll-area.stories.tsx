import { ScrollArea, Stack, Tag } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: '数据展示 Data Display/ScrollArea',
};
export default meta;

const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

export const Vertical: StoryObj = {
  render: () => (
    <ScrollArea
      maxHeight={200}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div style={{ padding: 16 }}>
        {items.map((item) => (
          <p
            key={item}
            style={{
              margin: '0 0 8px',
              color: 'var(--tao-color-text-secondary)',
            }}
          >
            {item}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: StoryObj = {
  render: () => (
    <ScrollArea
      direction="horizontal"
      maxWidth={400}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div
        style={{ display: 'flex', gap: 8, padding: 16, width: 'max-content' }}
      >
        {items.slice(0, 20).map((item) => (
          <Tag key={item} color="primary">
            {item}
          </Tag>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Both: StoryObj = {
  name: 'Both Directions',
  render: () => (
    <ScrollArea
      direction="both"
      maxHeight={200}
      maxWidth={300}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div style={{ width: 600, padding: 16 }}>
        {items.map((item) => (
          <p
            key={item}
            style={{
              margin: '0 0 8px',
              color: 'var(--tao-color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {item} — This is a long line that overflows the container
            horizontally to demonstrate both scrollbars.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const AlwaysVisible: StoryObj = {
  name: 'Always Visible Scrollbar',
  render: () => (
    <ScrollArea
      type="always"
      maxHeight={200}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div style={{ padding: 16 }}>
        {items.map((item) => (
          <p
            key={item}
            style={{
              margin: '0 0 8px',
              color: 'var(--tao-color-text-secondary)',
            }}
          >
            {item}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithShadow: StoryObj = {
  name: 'Scroll Shadows',
  render: () => (
    <ScrollArea
      scrollShadow
      maxHeight={200}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div style={{ padding: 16 }}>
        {items.map((item) => (
          <p
            key={item}
            style={{
              margin: '0 0 8px',
              color: 'var(--tao-color-text-secondary)',
            }}
          >
            {item}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const CustomSize: StoryObj = {
  name: 'Custom Scrollbar Size',
  render: () => (
    <Stack gap="lg">
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          Thin (4px)
        </p>
        <ScrollArea
          type="always"
          scrollbarSize={4}
          maxHeight={150}
          style={{
            border: '1px solid var(--tao-color-border-secondary)',
            borderRadius: 6,
          }}
        >
          <div style={{ padding: 16 }}>
            {items.slice(0, 30).map((item) => (
              <p
                key={item}
                style={{
                  margin: '0 0 8px',
                  color: 'var(--tao-color-text-secondary)',
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          Thick (10px)
        </p>
        <ScrollArea
          type="always"
          scrollbarSize={10}
          maxHeight={150}
          style={{
            border: '1px solid var(--tao-color-border-secondary)',
            borderRadius: 6,
          }}
        >
          <div style={{ padding: 16 }}>
            {items.slice(0, 30).map((item) => (
              <p
                key={item}
                style={{
                  margin: '0 0 8px',
                  color: 'var(--tao-color-text-secondary)',
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Stack>
  ),
};

export const HorizontalShadow: StoryObj = {
  name: 'Horizontal + Shadows',
  render: () => (
    <ScrollArea
      direction="horizontal"
      scrollShadow
      maxWidth={400}
      style={{
        border: '1px solid var(--tao-color-border-secondary)',
        borderRadius: 6,
      }}
    >
      <div
        style={{ display: 'flex', gap: 8, padding: 16, width: 'max-content' }}
      >
        {items.slice(0, 30).map((item) => (
          <div
            key={item}
            style={{
              flexShrink: 0,
              width: 100,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--tao-color-fill-quaternary)',
              borderRadius: 6,
              fontSize: 13,
              color: 'var(--tao-color-text-secondary)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
