import { createRef } from 'react';
import {
  Mentions,
  type MentionsProps,
  type MentionsRef,
} from '../../src/components/mentions/mentions';

const props: MentionsProps = {
  prefix: ['@', '#'],
  split: ',',
  autoSize: { minRows: 2, maxRows: 5 },
  onChange: (text) => {
    const value: string = text;
    void value;
  },
  onSearch: (text, prefix) => {
    const query: string = text + prefix;
    void query;
  },
  classNames: ({ props }) => ({ root: props.loading ? 'busy' : '' }),
  styles: { textarea: { resize: 'none' } },
};
const ref = createRef<MentionsRef>();
<Mentions {...props} ref={ref} />;
ref.current?.focus();
ref.current?.textarea?.setSelectionRange(0, 1);
const extracted: { value: string; prefix: string }[] = Mentions.getMentions(
  '@a,#b',
  { prefix: ['@', '#'], split: ',' },
);
void extracted;
// @ts-expect-error Mentions value is editable text, not a selected user list.
<Mentions value={['a']} />;
// @ts-expect-error Invalid semantic slot.
<Mentions styles={{ listItem: {} }} />;

<Mentions size="middle" />;
<Mentions size="medium" />;
// @ts-expect-error Invalid public size.
<Mentions size="normal" />;
