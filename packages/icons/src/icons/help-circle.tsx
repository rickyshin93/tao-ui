// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HelpCircleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HelpCircleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="8.7"/><path d="M9.25 9a2.75 2.75 0 0 1 5.5 0c0 1.6-2.75 1.8-2.75 3.7v.35"/><circle cx="12" cy="16.65" r=".85" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
