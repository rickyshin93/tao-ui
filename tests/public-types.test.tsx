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
  Table,
  type TableColumn,
  Textarea,
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
