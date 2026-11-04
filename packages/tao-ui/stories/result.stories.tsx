import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/button/button';
import { Result } from '../src/components/result/result';

export default { title: '反馈 Feedback/Result' } satisfies Meta;

export const Basic: StoryObj = {
  render: () => (
    <Result
      status="success"
      title="Report saved"
      subTitle="Your changes are ready to share."
      extra={<Button>View report</Button>}
    />
  ),
};
