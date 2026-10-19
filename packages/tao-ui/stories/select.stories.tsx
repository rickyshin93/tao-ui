import { FormField, Select, Stack } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '数据录入 Data Entry/Select',
};
export default meta;

function WorkspaceSwitcherIcon() {
  return (
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
    >
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}

export const Basic: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Basic">
        <Select
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
          ]}
          placeholder="Choose..."
        />
      </FormField>
    </Stack>
  ),
};

export const WithSearch: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="With search">
        <Select
          options={[
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Svelte', value: 'svelte' },
            { label: 'Solid', value: 'solid' },
          ]}
          placeholder="Search frameworks..."
          showSearch
        />
      </FormField>
    </Stack>
  ),
};

export const AllowClear: StoryObj = {
  render: () => {
    function Demo() {
      const [val, setVal] = useState('zh');
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="Allow clear">
            <Select
              options={[
                { label: 'English', value: 'en' },
                { label: '简体中文', value: 'zh' },
                { label: '日本語', value: 'ja' },
              ]}
              value={val}
              onChange={setVal}
              allowClear
              placeholder="Select language"
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LoadingAndPrefix: StoryObj = {
  name: 'Loading + Prefix',
  render: () => {
    function Demo() {
      const [loading, setLoading] = useState(false);
      const [options, setOptions] = useState<
        { label: string; value: string }[]
      >([]);

      const load = () => {
        setLoading(true);
        setOptions([]);
        setTimeout(() => {
          setOptions([
            { label: 'United States', value: 'us' },
            { label: 'United Kingdom', value: 'uk' },
            { label: 'Japan', value: 'jp' },
            { label: 'Germany', value: 'de' },
          ]);
          setLoading(false);
        }, 1500);
      };

      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <button type="button" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Load options'}
          </button>
          <FormField label="Async options (click to load)">
            <Select
              options={options}
              placeholder="Select a country"
              loading={loading}
              prefix={<span>🌍</span>}
              notFoundContent={loading ? 'Loading…' : 'No options — click load'}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LoadingStatic: StoryObj = {
  name: 'Loading (always on)',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Spinner replaces the arrow while loading">
        <Select options={[]} placeholder="Loading options…" loading />
      </FormField>
    </Stack>
  ),
};

export const DisabledOption: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Disabled option">
        <Select
          options={[
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise (contact us)', value: 'ent', disabled: true },
          ]}
          placeholder="Select plan"
        />
      </FormField>
    </Stack>
  ),
};

export const MobileMode: StoryObj = {
  name: 'Mobile Bottom Sheet',
  render: () => {
    function Demo() {
      const [val, setVal] = useState('');
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt-${i + 1}`,
      }));
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            Using <code>mobile</code> prop to force bottom sheet mode.
          </p>
          <FormField label="Mobile Select (few items)">
            <Select
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
              ]}
              value={val}
              onChange={setVal}
              placeholder="Choose framework"
              mobile
            />
          </FormField>
          <FormField label="Mobile Select (100 items, with search)">
            <Select
              options={manyOptions}
              placeholder="Pick from 100 options"
              showSearch
              mobile
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

// Rounded-square gradient avatar placeholder (stands in for a real logo).
function Avatar({ from, to }: { from: string; to: string }) {
  return (
    <span
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 30% 30%, ${from}, ${to})`,
      }}
    />
  );
}

const workspaceOptions = [
  {
    value: 'creative',
    label: 'ElevenCreative',
    description: 'Create, edit and localize content with AI',
    icon: <Avatar from="#ff9a6b" to="#e8453c" />,
  },
  {
    value: 'agents',
    label: 'ElevenAgents',
    description: 'Deploy and monitor conversational agents',
    icon: <Avatar from="#6be39a" to="#1f7a8c" />,
  },
  {
    value: 'api',
    label: 'ElevenAPI',
    description: 'Build with our leading AI audio models',
    icon: <Avatar from="#d9d9d9" to="#6b6b6b" />,
  },
];

export const WorkspaceSwitcher: StoryObj = {
  name: 'Workspace Switcher (icon + description)',
  render: () => {
    function Demo() {
      const [val, setVal] = useState('agents');
      return (
        <div style={{ maxWidth: 320 }}>
          <Select
            options={workspaceOptions}
            value={val}
            onChange={setVal}
            placeholder="Select workspace"
            suffixIcon={<WorkspaceSwitcherIcon />}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

export const Status: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Error">
        <Select
          options={[{ label: 'Option A', value: 'a' }]}
          value="a"
          status="error"
        />
      </FormField>
      <FormField label="Warning">
        <Select
          options={[{ label: 'Option A', value: 'a' }]}
          value="a"
          status="warning"
        />
      </FormField>
    </Stack>
  ),
};

export const Grouped: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Grouped options">
        <Select
          placeholder="Pick a food"
          options={[
            {
              label: 'Fruits',
              value: 'fruits',
              options: [
                { label: 'Apple', value: 'apple' },
                { label: 'Pear', value: 'pear' },
                { label: 'Orange', value: 'orange' },
              ],
            },
            {
              label: 'Vegetables',
              value: 'vegetables',
              options: [
                { label: 'Carrot', value: 'carrot' },
                { label: 'Spinach', value: 'spinach' },
              ],
            },
          ]}
        />
      </FormField>
    </Stack>
  ),
};

export const ControlledOpen: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <button type="button" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'Open'} dropdown
          </button>
          <Select
            open={open}
            onOpenChange={setOpen}
            options={[
              { label: 'Option A', value: 'a' },
              { label: 'Option B', value: 'b' },
            ]}
            placeholder="Controlled open"
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const CustomRender: StoryObj = {
  name: 'optionRender + labelRender',
  render: () => {
    function Demo() {
      const [val, setVal] = useState('b');
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <Select
            value={val}
            onChange={setVal}
            placeholder="Pick a color"
            options={[
              { label: 'Red', value: 'r' },
              { label: 'Green', value: 'g' },
              { label: 'Blue', value: 'b' },
            ]}
            labelRender={(o) => <strong>★ {o.label}</strong>}
            optionRender={(o, { index }) => (
              <span>
                {index + 1}. {o.label}
              </span>
            )}
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Placement: StoryObj = {
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400, paddingTop: 200 }}>
      <FormField label="topRight (opens upward)">
        <Select
          placement="topRight"
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
          ]}
          placeholder="Opens upward, right-aligned"
        />
      </FormField>
    </Stack>
  ),
};

export const PopupWidth: StoryObj = {
  name: 'popupMatchSelectWidth',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 240 }}>
      <FormField label="false → fit content">
        <Select
          popupMatchSelectWidth={false}
          options={[
            { label: 'A very long option label that overflows', value: 'a' },
            { label: 'Short', value: 'b' },
          ]}
          placeholder="Fit content"
        />
      </FormField>
      <FormField label="320 → fixed width">
        <Select
          popupMatchSelectWidth={320}
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          placeholder="Fixed 320px"
        />
      </FormField>
    </Stack>
  ),
};

export const SemanticDOM: StoryObj = {
  name: 'classNames / styles',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="Custom semantic styles">
        <Select
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value="a"
          styles={{
            root: { borderColor: '#7c3aed' },
            groupLabel: { color: '#7c3aed' },
          }}
        />
      </FormField>
    </Stack>
  ),
};

// ---- Multi-select ----

export const MultipleSelect: StoryObj = {
  name: 'mode="multiple"',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>(['react', 'vue']);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="Multi-select">
            <Select
              mode="multiple"
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
                { label: 'Solid', value: 'solid' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              placeholder="Select frameworks..."
            />
          </FormField>
          <p style={{ color: '#888', fontSize: 13 }}>
            Selected: {val.join(', ') || '(none)'}
          </p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MultipleWithTagRender: StoryObj = {
  name: 'mode="multiple" + tagRender',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>(['a', 'b']);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="Custom tag rendering">
            <Select
              mode="multiple"
              options={[
                { label: 'Option A', value: 'a' },
                { label: 'Option B', value: 'b' },
                { label: 'Option C', value: 'c' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              placeholder="Pick options"
              tagRender={(p) => (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  #{p.label}
                  {p.closable && (
                    <button
                      type="button"
                      onClick={p.onClose}
                      style={{
                        cursor: 'pointer',
                        marginLeft: 2,
                        border: 0,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MultipleMaxTagCount: StoryObj = {
  name: 'mode="multiple" + maxTagCount',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 400 }}>
      <FormField label="maxTagCount={2}">
        <Select
          mode="multiple"
          options={[
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Svelte', value: 'svelte' },
            { label: 'Solid', value: 'solid' },
            { label: 'Preact', value: 'preact' },
          ]}
          defaultValue={[
            'react',
            'vue',
            'angular',
            'svelte',
            'solid',
            'preact',
          ]}
          maxTagCount={2}
          maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
          placeholder="Pick frameworks"
        />
      </FormField>
    </Stack>
  ),
};

export const MultipleMaxCount: StoryObj = {
  name: 'mode="multiple" + maxCount',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>([]);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="maxCount={3} (limit reached disables remaining)">
            <Select
              mode="multiple"
              options={[
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' },
                { label: 'Date', value: 'date' },
                { label: 'Elderberry', value: 'elderberry' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              maxCount={3}
              placeholder="Pick up to 3 fruits"
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MultipleAllowClear: StoryObj = {
  name: 'mode="multiple" + allowClear',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>(['react', 'vue']);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="Clear all selections">
            <Select
              mode="multiple"
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              allowClear
              placeholder="Select frameworks"
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MultipleMobile: StoryObj = {
  name: 'mode="multiple" + mobile',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>(['react']);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <p style={{ color: '#888', fontSize: 13 }}>
            Multi-select with checkboxes and Done button.
          </p>
          <FormField label="Mobile multi-select">
            <Select
              mode="multiple"
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              placeholder="Choose frameworks"
              mobile
            />
          </FormField>
          <p style={{ color: '#888', fontSize: 13 }}>
            Selected: {val.join(', ') || '(none)'}
          </p>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MultipleHideSelected: StoryObj = {
  name: 'mode="multiple" + hideSelected',
  render: () => {
    function Demo() {
      const [val, setVal] = useState<string[]>(['react', 'vue']);
      return (
        <Stack gap="md" style={{ maxWidth: 400 }}>
          <FormField label="Selected options hidden from dropdown">
            <Select
              mode="multiple"
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
                { label: 'Solid', value: 'solid' },
              ]}
              value={val}
              onChange={(v) => setVal(v as string[])}
              hideSelected
              placeholder="Select frameworks"
            />
          </FormField>
        </Stack>
      );
    }
    return <Demo />;
  },
};
