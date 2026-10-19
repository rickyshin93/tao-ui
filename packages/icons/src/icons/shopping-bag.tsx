// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ShoppingBagIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ShoppingBagIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.15 7.2h11.7q1.65 0 1.8 1.65l.95 10.05q.15 1.85-1.7 1.85H5.1q-1.85 0-1.7-1.85l.95-10.05q.15-1.65 1.8-1.65Z"/><path d="M8.4 9.35v-3.1a3.6 3.6 0 0 1 7.2 0v3.1"/>
        {children}
      </svg>
    );
  },
);
