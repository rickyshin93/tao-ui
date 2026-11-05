import {
  Collapse,
  type CollapseExpandIconProps,
  type CollapseItem,
  type CollapseProps,
} from '../../src';
import { Collapse as SubpathCollapse } from '../../src/entries/collapse';

const items: CollapseItem[] = [
  {
    key: 1,
    label: 'Account',
    children: 'Details',
    extra: <button type="button">Edit</button>,
  },
];
const props: CollapseProps = {
  items,
  activeKey: [1, 'second'],
  accordion: true,
  onChange: (keys: string[]) => keys.join(','),
  expandIcon: ({ isActive }: CollapseExpandIconProps) =>
    isActive ? 'Open' : 'Closed',
  styles: { header: { color: 'red' }, body: { padding: 12 } },
};
<Collapse {...props} />;
<SubpathCollapse items={items} collapsible="icon" expandIconPlacement="end" />;
<Collapse defaultOpen>
  <Collapse.Trigger>Details</Collapse.Trigger>
  <Collapse.Content>Content</Collapse.Content>
</Collapse>;
// @ts-expect-error Active keys are strings or numbers, not booleans.
<Collapse items={items} activeKey={true} />;
// @ts-expect-error An item needs a stable key.
<Collapse items={[{ label: 'Missing key' }]} />;
// @ts-expect-error Trigger mode has a closed vocabulary.
<Collapse items={items} collapsible="click" />;
