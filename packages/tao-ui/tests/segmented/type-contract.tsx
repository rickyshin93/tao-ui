import { createRef } from 'react';
import { Segmented, type SegmentedProps } from '../../src/entries/segmented';

export const numberSelection = (
  <Segmented
    options={[1, 2, 3]}
    defaultValue={1}
    ref={createRef<HTMLDivElement>()}
    onChange={(value) => {
      const number: number = value;
      void number;
    }}
  />
);
export const stringSelection = (
  <Segmented<'day' | 'month'>
    options={[
      { value: 'day', label: 'Day' },
      { value: 'month', icon: '+' },
    ]}
    value="day"
    onChange={(value) => {
      const period: 'day' | 'month' = value;
      void period;
    }}
    motionName="custom-motion"
  />
);
export const segmentedProps: SegmentedProps<number> = {
  options: [1, 2],
  value: 1,
  classNames: ({ props }) => ({ root: String(props.value) }),
};
export const invalidSelection = (
  // @ts-expect-error Explicit numeric options cannot be controlled with a string.
  <Segmented<number> options={[1, 2]} value="1" />
);
