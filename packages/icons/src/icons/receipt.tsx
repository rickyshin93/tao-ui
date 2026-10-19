// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ReceiptIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ReceiptIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5.1 3.25 7.4 4.9l2.3-1.65L12 4.9l2.3-1.65 2.3 1.65 2.3-1.65v17.5l-2.3-1.65-2.3 1.65L12 19.1l-2.3 1.65-2.3-1.65-2.3 1.65Z"/><path d="M8.65 9.4h6.7m-6.7 4.85h4.9"/>
        {children}
      </svg>
    );
  },
);
