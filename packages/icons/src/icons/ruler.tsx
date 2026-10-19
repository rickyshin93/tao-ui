// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RulerIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RulerIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.7 15.3 11.6-11.6q.8-.8 1.6 0l3.4 3.4q.8.8 0 1.6L8.7 20.3q-.8.8-1.6 0l-3.4-3.4q-.8-.8 0-1.6ZM7.8 11.2l2.1 2.1m1.6-5.8 2.1 2.1m1.6-5.8 2.1 2.1"/>
        {children}
      </svg>
    );
  },
);
