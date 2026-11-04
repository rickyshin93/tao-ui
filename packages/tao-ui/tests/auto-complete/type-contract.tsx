import { createRef } from 'react';
import {
  AutoComplete,
  type AutoCompleteProps,
  type AutoCompleteRef,
} from '../../src/components/auto-complete/auto-complete';

interface Person {
  value: string;
  label: string;
  age: number;
}
const props: AutoCompleteProps<string, Person> = {
  options: [{ value: 'a', label: 'A', age: 30 }],
  onSelect: (value, option) => {
    const selected: string = value;
    const age: number = option.age;
    void selected;
    void age;
  },
  showSearch: { filterOption: (_input, option) => !!option && option.age > 20 },
};
const ref = createRef<AutoCompleteRef>();
<AutoComplete<string, Person>
  {...props}
  ref={ref}
  classNames={({ props }) => ({
    root: props.disabled ? 'disabled' : '',
    popup: { listItem: 'item' },
  })}
/>;
ref.current?.focus();
<AutoComplete>
  <textarea rows={3} />
</AutoComplete>;
<AutoComplete>
  <AutoComplete.Option value="legacy">Legacy</AutoComplete.Option>
</AutoComplete>;
// @ts-expect-error Autocomplete is an editable single-value control.
<AutoComplete mode="multiple" />;
// @ts-expect-error The default public value is a string.
<AutoComplete<string> value={1} />;

<AutoComplete size="middle" />;
<AutoComplete size="medium" />;
// @ts-expect-error Invalid public size.
<AutoComplete size="normal" />;
