import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Avatar } from '../src/components/avatar/avatar';
import { Card } from '../src/components/card/card';
export default {
  title: '数据展示 Data Display/Card',
  component: Card,
} satisfies Meta<typeof Card>;
export const Basic: StoryObj<typeof Card> = {
  render: () => (
    <Card
      title="Design workspace"
      extra={<a href="#details">Details</a>}
      style={{ width: 360 }}
    >
      <Card.Meta
        avatar={<Avatar>RH</Avatar>}
        title="Product library"
        description="Shared components and accessible patterns."
      />
    </Card>
  ),
};
function TabsExample() {
  const [active, setActive] = useState('overview');
  return (
    <Card
      title="Project"
      activeTabKey={active}
      onTabChange={setActive}
      tabList={[
        { key: 'overview', label: 'Overview' },
        { key: 'activity', label: 'Activity' },
      ]}
    >
      {active === 'overview' ? 'Project overview' : 'Recent updates'}
    </Card>
  );
}
export const WithTabs: StoryObj<typeof Card> = {
  render: () => <TabsExample />,
};
