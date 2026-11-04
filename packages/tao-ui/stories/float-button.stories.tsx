import type { Meta, StoryObj } from '@storybook/react';
import { FloatButton } from '../src/components/float-button/float-button';
export default {
  title: '通用 General/FloatButton',
  component: FloatButton,
} satisfies Meta<typeof FloatButton>;
export const Actions: StoryObj<typeof FloatButton> = {
  render: () => (
    <div style={{ height: 260 }}>
      <FloatButton.Group trigger="click" type="primary" tooltip="Actions">
        <FloatButton tooltip="Help" content="?" />
        <FloatButton tooltip="Messages" content="Msg" badge={{ count: 4 }} />
      </FloatButton.Group>
    </div>
  ),
};
export const Square: StoryObj<typeof FloatButton> = {
  render: () => (
    <div style={{ height: 260 }}>
      <FloatButton.Group shape="square">
        <FloatButton content="A" tooltip="Action A" />
        <FloatButton content="B" tooltip="Action B" />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
    </div>
  ),
};
