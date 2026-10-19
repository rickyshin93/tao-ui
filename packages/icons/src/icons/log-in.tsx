// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LogInIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LogInIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M13.75 3.6h4.7q1.85 0 1.85 1.85v13.1q0 1.85-1.85 1.85h-4.7M3.5 12h12M11.1 7.7l4.05 3.9q.4.4 0 .8l-4.05 3.9"/>
        {children}
      </svg>
    );
  },
);
