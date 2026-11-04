import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { Affix } from '../src/components/affix/affix';
import { Button } from '../src/components/button/button';
export default {
  title: '导航 Navigation/Affix',
  component: Affix,
} satisfies Meta<typeof Affix>;
export const ScrollContainer: StoryObj<typeof Affix> = {
  render: () => {
    const target = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={target}
        style={{
          height: 240,
          overflow: 'auto',
          border: '1px solid var(--tao-color-border)',
        }}
      >
        <div style={{ height: 80 }} />
        <Affix offsetTop={12} target={() => target.current}>
          <Button variant="primary">Pinned tools</Button>
        </Affix>
        <div style={{ height: 600, padding: 24 }}>Scroll this container.</div>
      </div>
    );
  },
};
