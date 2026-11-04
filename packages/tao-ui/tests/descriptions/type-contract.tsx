import { createRef } from 'react';
import {
  Descriptions,
  type DescriptionsItemType,
  type DescriptionsRef,
} from '../../src/entries/descriptions';
import { Statistic, type StatisticRef } from '../../src/entries/statistic';
import { Timeline, type TimelineItemType } from '../../src/entries/timeline';

const records: DescriptionsItemType[] = [
  { key: 'name', label: 'Name', children: 'Ada', span: { xs: 1, xxxl: 2 } },
  { key: 'details', children: 'Details', span: 'filled' },
];
export const descriptions = (
  <Descriptions
    ref={createRef<DescriptionsRef>()}
    items={records}
    column={{ xs: 1, xxxl: 4 }}
  />
);
export const statistic = (
  <Statistic
    ref={createRef<StatisticRef>()}
    value="123.456"
    precision={2}
    styles={{ value: { color: 'red' } }}
  />
);
export const timer = (
  <Statistic.Timer
    type="countdown"
    value={Date.now()}
    onChange={(value) => {
      const time: string | number | undefined = value;
      void time;
    }}
  />
);
const events: TimelineItemType[] = [
  {
    content: 'Done',
    placement: 'end',
    styles: { rail: { borderStyle: 'dotted' } },
  },
];
export const timeline = (
  <Timeline
    items={events}
    titleSpan="25%"
    orientation="horizontal"
    variant="filled"
  />
);
// @ts-expect-error Timer type is required.
export const invalidTimer = <Statistic.Timer value={Date.now()} />;
