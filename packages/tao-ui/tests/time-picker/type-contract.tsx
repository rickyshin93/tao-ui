import dayjs from 'dayjs';
import { createRef } from 'react';
import {
  TimePicker,
  type TimePickerRef,
  type TimeRangePickerRef,
} from '../../src';

const single = createRef<TimePickerRef>();
const range = createRef<TimeRangePickerRef>();
<TimePicker size="medium" />;
<TimePicker size="middle" />;
<TimePicker.RangePicker size="medium" />;
<TimePicker.RangePicker size="middle" />;
<TimePicker
  ref={single}
  value={null}
  onChange={(date, formatted) => {
    date?.hour();
    formatted?.toUpperCase();
  }}
/>;
<TimePicker.RangePicker
  ref={range}
  value={[dayjs(), null]}
  allowEmpty={[false, true]}
  disabledTime={(_date, position) => ({
    disabledHours: () => (position === 'start' ? [0] : []),
  })}
/>;
single.current?.focus({ preventScroll: true });
range.current?.focus({ index: 1, preventScroll: true });
// @ts-expect-error TimePicker consumes Day.js objects, not serialized strings
<TimePicker value="09:30" />;
// @ts-expect-error ranges must retain the two-value tuple
<TimePicker.RangePicker value={[dayjs()]} />;
