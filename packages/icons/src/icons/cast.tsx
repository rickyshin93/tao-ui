// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CastIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CastIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.1 4.1h10.85q1.85 0 1.85 1.85v9.6q0 1.85-1.85 1.85h-1.9M3.4 9.6a10.9 10.9 0 0 1 10.9 10.9M3.4 14.7a5.8 5.8 0 0 1 5.8 5.8"/><circle cx="3.4" cy="20.5" r="1.3" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
