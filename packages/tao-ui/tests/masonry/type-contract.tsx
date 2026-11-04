import { createRef } from 'react';
import { Affix, type AffixRef } from '../../src/entries/affix';
import {
  BorderBeam,
  type BorderBeamGradient,
} from '../../src/entries/border-beam';
import {
  FloatButton,
  type FloatButtonElement,
  type FloatButtonGroupRef,
  type FloatButtonRef,
} from '../../src/entries/float-button';
import { Masonry, type MasonryRef } from '../../src/entries/masonry';
import {
  Watermark,
  type WatermarkRef,
  type WatermarkText,
} from '../../src/entries/watermark';
export const affix = (
  <Affix
    ref={createRef<AffixRef>()}
    target={() => document.body}
    offsetBottom={20}
    onChange={(affixed) => {
      const value: boolean | undefined = affixed;
      void value;
    }}
  >
    Tools
  </Affix>
);
export const masonry = (
  <Masonry
    ref={createRef<MasonryRef>()}
    columns={{ xs: 1, xxxl: 5 }}
    gutter={[{ xs: 4, md: 16 }, 20]}
    items={[{ key: 'one', data: { title: 'One' } }]}
    itemRender={({ data, column }) => (
      <span>
        {data.title}: {column}
      </span>
    )}
    onLayoutChange={(order) => {
      const column: number = order[0].column;
      void column;
    }}
  />
);
const gradient: BorderBeamGradient = [
  { color: 'red', percent: 0 },
  { color: 'blue', percent: 100 },
];
export const beam = (
  <BorderBeam color={gradient} size="30%" items={[{ lineWidth: 2 }]}>
    <div />
  </BorderBeam>
);
export const floating = (
  <FloatButton
    ref={createRef<FloatButtonElement>()}
    href="/help"
    target="_blank"
    content="Help"
    tooltip={{ title: 'Help', placement: 'left' }}
  />
);
export const group = (
  <FloatButton.Group
    ref={createRef<FloatButtonGroupRef>()}
    trigger="click"
    placement="left"
  >
    <FloatButton.BackTop
      ref={createRef<FloatButtonRef>()}
      target={() => document}
      showProgress
    />
  </FloatButton.Group>
);
const lines: WatermarkText[] = [
  { text: 'Private', font: { fontStyle: 'italic', textAlign: 'start' } },
];
export const watermark = (
  <Watermark
    ref={createRef<WatermarkRef>()}
    content={lines}
    inherit={false}
    classNames={{ mark: 'mark' }}
  />
);
export const invalidData = (
  <Masonry
    items={[{ key: 'one', data: { title: 'One' } }]}
    // @ts-expect-error Masonry preserves the declared data shape in callbacks.
    itemRender={({ data }) => data.missing}
  />
);
