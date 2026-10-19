// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ServiceRequestIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ServiceRequestIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 5.5H6q-1.5 0-1.5 1.5v12q0 1.5 1.5 1.5h12q1.5 0 1.5-1.5V7q0-1.5-1.5-1.5h-2"/><rect x="8" y="3.5" width="8" height="4" rx="1"/><path d="M8.5 13.5h7"/>
        {children}
      </svg>
    );
  },
);
