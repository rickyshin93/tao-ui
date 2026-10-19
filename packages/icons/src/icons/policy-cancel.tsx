// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyCancelIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyCancelIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="3" width="16" height="18" rx="1.8"/><path d="M3 21 21 3"/>
        {children}
      </svg>
    );
  },
);
