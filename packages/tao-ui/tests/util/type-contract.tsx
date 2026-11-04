import { Component, createContext, createRef, forwardRef } from 'react';
import { type GetProp, type GetProps, type GetRef, Input } from '../../src';

interface ChoiceProps {
  options?: { label: string; value: number }[];
  onChange?: (value: number) => Promise<string>;
}

function Choice(_props: ChoiceProps) {
  return null;
}

const option: GetProp<typeof Choice, 'options'>[number] = {
  label: 'One',
  value: 1,
};
const props: GetProps<typeof Choice> = { options: [option] };
const objectProps: GetProps<ChoiceProps> = props;
const callback: GetProp<ChoiceProps, 'onChange'> = async (value) =>
  String(value);
const result: GetProp<typeof Choice, 'onChange', 'Return'> = callback(1);
const Context = createContext({ enabled: true });
const contextValue: GetProps<typeof Context> = { enabled: false };
const NativeInput = forwardRef<HTMLInputElement, ChoiceProps>(() => null);
const nativeRef = createRef<GetRef<typeof NativeInput>>();
const inputRef = createRef<GetRef<typeof Input>>();

<NativeInput {...props} ref={nativeRef} />;
<Input ref={inputRef} />;
inputRef.current?.select();

class Example extends Component {
  focus() {}
}
const example: GetRef<Example> = new Example({});
example.focus();

// @ts-expect-error the option value contract remains numeric
const wrongOption: GetProp<typeof Choice, 'options'>[number] = { value: 'one' };
// @ts-expect-error unknown props must fail at the utility boundary
type Missing = GetProp<ChoiceProps, 'missing'>;
// @ts-expect-error function return inference preserves the Promise
const wrongReturn: GetProp<ChoiceProps, 'onChange', 'Return'> = 'one';
// @ts-expect-error an input ref cannot accept a button instance
const wrongRef: GetRef<typeof NativeInput> = document.createElement('button');

void [objectProps, result, contextValue, wrongOption, wrongReturn, wrongRef];

export type { Missing };
