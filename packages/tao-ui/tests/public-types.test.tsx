import { createRef } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  type PickerRef,
  Radio,
  RangePicker,
  Select,
  type SelectRef,
  Switch,
  Spinner,
  Tabs,
  Modal,
  Drawer,
  Popover,
  Table,
  type TableColumn,
  Textarea,
  TaoProvider,
  zhCN,
  type TaoLocale,
} from '../src';

const buttonRef = createRef<HTMLButtonElement>();
const inputRef = createRef<HTMLInputElement>();
const textareaRef = createRef<HTMLTextAreaElement>();
const switchRef = createRef<HTMLButtonElement>();
const selectRef = createRef<SelectRef>();
const pickerRef = createRef<PickerRef>();

<Button ref={buttonRef}>Save</Button>;
<Checkbox ref={inputRef}>Accept</Checkbox>;
<Radio ref={inputRef}>Option</Radio>;
<Input ref={inputRef} status="warning" />;
<InputNumber ref={inputRef} status="error" />;
<Textarea ref={textareaRef} status="warning" />;
<Switch ref={switchRef} />;
<Select ref={selectRef} options={[]} />;
<DatePicker ref={pickerRef} />;
<RangePicker ref={pickerRef} />;

interface Person {
  id: number;
  name: string;
}

const columns: TableColumn<Person>[] = [
  { dataIndex: 'name', title: 'Name', render: (value) => String(value) },
];
<Table columns={columns} dataSource={[]} rowKey="id" />;

const invalidColumns: TableColumn<Person>[] = [
  // @ts-expect-error unknown record keys must not compile
  { dataIndex: 'missing', title: 'Missing' },
];
void invalidColumns;

// Field semantics must remain public in both React type environments.
const fieldAria = {
  id: 'booking',
  'aria-label': 'Booking',
  'aria-labelledby': 'booking-label',
  'aria-describedby': 'booking-help',
  'aria-errormessage': 'booking-error',
  'aria-invalid': true,
  'aria-required': true,
} as const;
<InputNumber {...fieldAria} />;
<DatePicker {...fieldAria} />;
<RangePicker {...fieldAria} />;
<Checkbox {...fieldAria} />;
<Radio {...fieldAria} />;
<Radio required aria-label="Choice" />;
<Switch {...fieldAria} />;
<Spinner aria-label="Loading results" />;
<Tabs aria-label="Details" items={[]} />;
<Modal open aria-label="Review" aria-describedby="review-help" />;
<Drawer open aria-label="Details" aria-describedby="details-help" />;
<Popover aria-label="Actions" content="Details">
  <button type="button">Open</button>
</Popover>;

const customLocale: Partial<TaoLocale> = { ...zhCN, done: 'Confirm' };
<TaoProvider locale={customLocale}>
  <Select options={[]} mode="tags" maxTagCount="responsive" />
</TaoProvider>;
