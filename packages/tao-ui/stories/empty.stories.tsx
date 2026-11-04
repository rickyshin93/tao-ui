import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/button/button';
import { Empty } from '../src/components/empty/empty';

export default { title: '数据展示 Data Display/Empty' } satisfies Meta;

export const Basic: StoryObj = {
  render: () => (
    <Empty description="No saved reports">
      <Button>Create report</Button>
    </Empty>
  ),
};
