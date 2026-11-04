import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { Button } from '../src/components/button/button';
import { Tour } from '../src/components/tour/tour';

function TourExample({ primary = false }: { primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  const second = useRef<HTMLButtonElement>(null);
  return (
    <>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button ref={first}>Upload</Button>
        <Button ref={second}>Save</Button>
        <Button onClick={() => setOpen(true)}>Start tour</Button>
      </div>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        type={primary ? 'primary' : 'default'}
        steps={[
          {
            title: 'Upload a file',
            description: 'Start by choosing a document.',
            target: () => first.current,
          },
          {
            title: 'Save your work',
            description: 'Review and save when you are ready.',
            target: () => second.current,
          },
        ]}
      />
    </>
  );
}
const meta = { title: '反馈 Feedback/Tour', component: Tour } satisfies Meta<
  typeof Tour
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = { render: () => <TourExample /> };
export const Primary: Story = { render: () => <TourExample primary /> };
export const Centered: Story = {
  args: {
    open: true,
    steps: [
      {
        title: 'Welcome',
        description: 'A centered step does not require a target.',
      },
    ],
  },
};
