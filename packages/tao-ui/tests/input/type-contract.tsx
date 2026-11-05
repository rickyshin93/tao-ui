import { createRef } from 'react';
import {
  Input,
  type InputRef,
  type OTPRef,
  type TextAreaRef,
  Textarea,
} from '../../src';
import {
  type CountConfig,
  Input as SubpathInput,
} from '../../src/entries/input';

const nativeRef = createRef<HTMLInputElement>();
const ref = createRef<InputRef>();
const textareaRef = createRef<TextAreaRef>();
const otpRef = createRef<OTPRef>();
const count: CountConfig = {
  max: 6,
  strategy: (value) => Array.from(value).length,
  show: true,
};
<Input
  ref={nativeRef}
  allowClear
  showCount
  count={count}
  onPressEnter={(event) => event.currentTarget.select()}
/>;
<Input.Password
  ref={ref}
  visibilityToggle={{
    visible: true,
    onVisibleChange: (value) => Boolean(value),
  }}
/>;
<SubpathInput.Search
  ref={ref}
  onSearch={(value, event, info) => {
    value.toUpperCase();
    event?.preventDefault();
    info?.source.toUpperCase();
  }}
  classNames={({ props }) => ({ button: props.loading ? 'busy' : '' })}
/>;
<Input.TextArea ref={textareaRef} count={count} autoSize />;
<Textarea ref={createRef<HTMLTextAreaElement>()} allowClear />;
<Input.OTP ref={otpRef} onInput={(values) => values.join('')} />;
ref.current?.focus({ cursor: 'end', preventScroll: true });
ref.current?.input.select();
textareaRef.current?.focus({ cursor: 'all' });
otpRef.current?.focus();
