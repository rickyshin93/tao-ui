import {
  Button,
  Checkbox,
  FormField,
  Input,
  Select,
  Stack,
  Switch,
  Tag,
  TaoProvider,
} from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { type CSSProperties, useState } from 'react';

const meta: Meta = {
  title: '配置 Config/TaoProvider',
};
export default meta;

// ---------- shared helpers (story-local, not exported to lib) ----------

const swatchLabel: CSSProperties = {
  fontSize: 12,
  color: 'var(--tao-color-text-tertiary)',
  minWidth: 72,
  fontFamily: 'var(--tao-font-family-code)',
};

function ControlRow({
  label,
  selectOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ],
}: {
  label: string;
  selectOptions?: { value: string; label: string }[];
}) {
  return (
    <Stack direction="horizontal" gap="sm" align="center">
      <span style={swatchLabel}>{label}</span>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Input placeholder="Input" style={{ width: 140 }} />
      <Select options={selectOptions} style={{ width: 140 }} />
      <Switch defaultChecked />
      <Checkbox defaultChecked>Check</Checkbox>
      <Tag color="primary" variant="solid">
        Tag
      </Tag>
    </Stack>
  );
}

// ---------- existing stories ----------

export const GlobalSize: StoryObj = {
  name: 'Global Size',
  render: () => (
    <Stack gap="lg">
      <TaoProvider size="small">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>small</span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
      <TaoProvider size="medium">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>medium</span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
      <TaoProvider size="large">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>large</span>
          <Button>Button</Button>
          <Input placeholder="Input" style={{ width: 160 }} />
        </Stack>
      </TaoProvider>
    </Stack>
  ),
};

export const GlobalVariant: StoryObj = {
  name: 'Global Variant',
  render: () => (
    <Stack gap="lg">
      <TaoProvider variant="outlined">
        <FormField label="Outlined" style={{ maxWidth: 300 }}>
          <Input placeholder="outlined" />
        </FormField>
      </TaoProvider>
      <TaoProvider variant="filled">
        <FormField label="Filled" style={{ maxWidth: 300 }}>
          <Input placeholder="filled" />
        </FormField>
      </TaoProvider>
      <TaoProvider variant="borderless">
        <FormField label="Borderless" style={{ maxWidth: 300 }}>
          <Input placeholder="borderless" />
        </FormField>
      </TaoProvider>
    </Stack>
  ),
};

// ---------- new: color / brand ----------

// Real-world palettes. All OKLCH so contrast/mixing stays predictable when
// the token flows through color-mix() derivations (bg, border, hover, ring).
const BRAND_PALETTES = [
  { name: 'Default (Anthropic-neutral)', color: 'oklch(0.205 0.01 70)' },
  { name: 'Vercel Black', color: 'oklch(0.145 0 0)' },
  { name: 'Linear Indigo', color: 'oklch(0.52 0.19 275)' },
  { name: 'Stripe Purple', color: 'oklch(0.55 0.22 300)' },
  { name: 'Supabase Green', color: 'oklch(0.62 0.17 155)' },
  { name: 'Notion Orange', color: 'oklch(0.68 0.17 45)' },
];

export const BrandColors: StoryObj = {
  name: 'Brand Colors · primary override',
  render: () => (
    <Stack gap="lg">
      {BRAND_PALETTES.map((p) => (
        <TaoProvider key={p.name} theme={{ token: { colorPrimary: p.color } }}>
          <Stack gap="sm">
            <span style={swatchLabel}>{p.name}</span>
            <ControlRow label={p.color.slice(0, 22)} />
          </Stack>
        </TaoProvider>
      ))}
    </Stack>
  ),
};

export const SemanticColors: StoryObj = {
  name: 'Semantic Colors · success / warning / error',
  render: () => (
    <TaoProvider
      theme={{
        token: {
          // Nudge from default: greener success, softer warning, oranger error.
          colorSuccess: 'oklch(0.7 0.18 155)',
          colorWarning: 'oklch(0.78 0.16 85)',
          colorError: 'oklch(0.62 0.22 25)',
        },
      }}
    >
      <Stack gap="md">
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>success</span>
          <Tag color="success" variant="solid">
            Deployed
          </Tag>
          <Tag color="success" variant="filled">
            Passed
          </Tag>
          <Tag color="success" variant="outlined">
            Ready
          </Tag>
        </Stack>
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>warning</span>
          <Tag color="warning" variant="solid">
            Degraded
          </Tag>
          <Tag color="warning" variant="filled">
            Preview
          </Tag>
          <Tag color="warning" variant="outlined">
            Draft
          </Tag>
        </Stack>
        <Stack direction="horizontal" gap="sm" align="center">
          <span style={swatchLabel}>error</span>
          <Tag color="error" variant="solid">
            Failed
          </Tag>
          <Tag color="error" variant="filled">
            Blocked
          </Tag>
          <Tag color="error" variant="outlined">
            Broken
          </Tag>
          <Button variant="destructive">Delete</Button>
        </Stack>
        <FormField
          label="Error input (focus me)"
          description="ring color follows colorError token"
          style={{ maxWidth: 320 }}
        >
          <Input error placeholder="focus to see error ring" />
        </FormField>
      </Stack>
    </TaoProvider>
  ),
};

// ---------- new: radius ----------

const RADIUS_STEPS = [
  { name: 'sharp', value: 2 },
  { name: 'default (10)', value: 10 },
  { name: 'rounded', value: 16 },
  { name: 'pill-ish', value: 24 },
];

export const RadiusScale: StoryObj = {
  name: 'Radius · borderRadius override',
  render: () => (
    <Stack gap="lg">
      {RADIUS_STEPS.map((r) => (
        <TaoProvider key={r.name} theme={{ token: { borderRadius: r.value } }}>
          <Stack gap="sm">
            <span style={swatchLabel}>
              {r.name} · {r.value}px
            </span>
            <ControlRow label={`r-${r.value}`} />
          </Stack>
        </TaoProvider>
      ))}
    </Stack>
  ),
};

// ---------- new: nested isolation + inheritance ----------

export const NestedIsolation: StoryObj = {
  name: 'Nested · isolation + inheritance',
  render: () => (
    <TaoProvider
      size="large"
      theme={{ token: { colorPrimary: 'oklch(0.55 0.22 300)' } }} // outer: purple + large
    >
      <Stack gap="md">
        <span style={swatchLabel}>outer · purple / large</span>
        <ControlRow label="outer" />

        <div
          style={{
            paddingLeft: 16,
            borderLeft: '2px solid var(--tao-color-border)',
          }}
        >
          <TaoProvider
            theme={{ token: { colorPrimary: 'oklch(0.68 0.17 45)' } }} // inner: orange, size inherited (=large)
          >
            <Stack gap="sm">
              <span style={swatchLabel}>
                inner · orange, size inherited (large)
              </span>
              <ControlRow label="inner" />
            </Stack>
          </TaoProvider>
        </div>

        <div
          style={{
            paddingLeft: 16,
            borderLeft: '2px solid var(--tao-color-border)',
          }}
        >
          <TaoProvider size="small">
            {/* only size, no token override: color stays purple, size collapses to small */}
            <Stack gap="sm">
              <span style={swatchLabel}>
                inner · color inherited (purple), size=small
              </span>
              <ControlRow label="inner" />
            </Stack>
          </TaoProvider>
        </div>
      </Stack>
    </TaoProvider>
  ),
};

// ---------- new: portal theming ----------

export const PortalTheming: StoryObj = {
  name: 'Portal · popup respects theme',
  render: () => (
    <Stack gap="lg">
      <span style={swatchLabel}>
        Select popup portals to body but still reads the closest TaoProvider —
        both dropdowns below should match their parent primary.
      </span>
      <Stack direction="horizontal" gap="lg" align="start">
        <TaoProvider
          theme={{ token: { colorPrimary: 'oklch(0.52 0.19 275)' } }}
        >
          <FormField label="Linear-indigo scope" style={{ width: 240 }}>
            <Select
              defaultOpen
              options={[
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta' },
                { value: 'c', label: 'Gamma' },
              ]}
            />
          </FormField>
        </TaoProvider>
        <TaoProvider theme={{ token: { colorPrimary: 'oklch(0.68 0.17 45)' } }}>
          <FormField label="Notion-orange scope" style={{ width: 240 }}>
            <Select
              defaultOpen
              options={[
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta' },
                { value: 'c', label: 'Gamma' },
              ]}
            />
          </FormField>
        </TaoProvider>
      </Stack>
    </Stack>
  ),
};

// ---------- new: dark mode ----------

export const DarkMode: StoryObj = {
  name: 'Dark Mode · theme.mode',
  render: () => (
    <Stack gap="lg">
      <span style={swatchLabel}>
        {'theme={{ mode: "dark" }}'} flips the whole scope via the pure-CSS
        dark algorithm — compare with the Light/Dark toolbar toggle above.
      </span>
      <TaoProvider theme={{ mode: 'dark' }}>
        <div
          style={{
            background: 'var(--tao-color-bg-base)',
            border: '1px solid var(--tao-color-border)',
            borderRadius: 'var(--tao-radius-lg)',
            padding: 24,
          }}
        >
          <Stack gap="md">
            <ControlRow label="dark" />
            <FormField label="Input in dark scope" style={{ maxWidth: 320 }}>
              <Input placeholder="focus to see the ring" />
            </FormField>
          </Stack>
        </div>
      </TaoProvider>
    </Stack>
  ),
};

// ---------- new: dynamic switching (also stress-tests memoization) ----------

export const DynamicSwitching: StoryObj = {
  name: 'Dynamic · runtime theme swap',
  render: () => {
    function Demo() {
      const [idx, setIdx] = useState(0);
      const current = BRAND_PALETTES[idx];
      return (
        <Stack gap="md">
          <Stack direction="horizontal" gap="sm">
            {BRAND_PALETTES.map((p, i) => (
              <Button
                key={p.name}
                variant={i === idx ? 'primary' : 'secondary'}
                onClick={() => setIdx(i)}
              >
                {p.name.split(' ')[0]}
              </Button>
            ))}
          </Stack>
          <TaoProvider theme={{ token: { colorPrimary: current.color } }}>
            <Stack gap="sm">
              <span style={swatchLabel}>active · {current.name}</span>
              <ControlRow label="live" />
            </Stack>
          </TaoProvider>
        </Stack>
      );
    }
    return <Demo />;
  },
};

// ---------- new: layout transparency (regression guard for the display:contents fix) ----------

export const LayoutTransparent: StoryObj = {
  name: 'Layout · display:contents (grid parent)',
  render: () => (
    <Stack gap="lg">
      <span style={swatchLabel}>
        Children of a single TaoProvider must land in separate grid columns. If
        the wrapper collapsed layout, both cards would stack in column 1.
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 12,
          border: '1px dashed var(--tao-color-border)',
          padding: 12,
          borderRadius: 'var(--tao-radius-md)',
        }}
      >
        <TaoProvider
          theme={{ token: { colorPrimary: 'oklch(0.52 0.19 275)' } }}
        >
          <div
            style={{
              background: 'var(--tao-primary-bg)',
              border: '1px solid var(--tao-primary-border)',
              borderRadius: 'var(--tao-radius-md)',
              padding: 12,
            }}
          >
            <b>Sidebar</b>
            <div
              style={{ fontSize: 12, color: 'var(--tao-color-text-tertiary)' }}
            >
              col 1 · 200px
            </div>
          </div>
          <div
            style={{
              background: 'var(--tao-color-bg-container)',
              border: '1px solid var(--tao-color-border)',
              borderRadius: 'var(--tao-radius-md)',
              padding: 12,
            }}
          >
            <b>Main</b>
            <div
              style={{ fontSize: 12, color: 'var(--tao-color-text-tertiary)' }}
            >
              col 2 · 1fr — buttons below should feel indigo
            </div>
            <Stack direction="horizontal" gap="sm">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
            </Stack>
          </div>
        </TaoProvider>
      </div>
    </Stack>
  ),
};

export const ComponentTokens: StoryObj = {
  render: () => (
    <Stack gap="md">
      <div style={{ fontSize: 12, color: 'var(--tao-color-text-tertiary)' }}>
        theme.components.Button — pill radius + custom padding/font weight
      </div>
      <TaoProvider
        theme={{
          components: {
            Button: { borderRadius: 9999, paddingInline: 24, fontWeight: 500 },
          },
        }}
      >
        <Stack direction="horizontal" gap="sm">
          <Button variant="primary">Pill Primary</Button>
          <Button variant="secondary">Pill Secondary</Button>
        </Stack>
      </TaoProvider>
    </Stack>
  ),
};

export const CompactDensity: StoryObj = {
  render: () => (
    <Stack gap="md">
      <div style={{ fontSize: 12, color: 'var(--tao-color-text-tertiary)' }}>
        theme.compact: control height 32→28, paddings one notch tighter
      </div>
      <Stack direction="horizontal" gap="lg" align="start">
        <Stack gap="sm">
          <b>Default</b>
          <Input placeholder="Input" />
          <Button variant="primary">Button</Button>
        </Stack>
        <TaoProvider theme={{ compact: true }}>
          <Stack gap="sm">
            <b>Compact</b>
            <Input placeholder="Input" />
            <Button variant="primary">Button</Button>
          </Stack>
        </TaoProvider>
      </Stack>
    </Stack>
  ),
};
