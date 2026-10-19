// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ShoppingCartIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ShoppingCartIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 3.8h1.8q.8 0 .95.8L7.4 13.5q.15.9 1.1.9H18q.9 0 1.1-.9l1.4-6.4H6.3"/><circle cx="9" cy="19.9" r="1.9"/><circle cx="18" cy="19.9" r="1.9"/>
        {children}
      </svg>
    );
  },
);
