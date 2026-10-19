// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PrinterIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PrinterIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7 8.6V3.7h10v4.9M7 17H4.85Q3.1 17 3.1 15.25v-5.1q0-1.75 1.75-1.75h14.3q1.75 0 1.75 1.75v5.1q0 1.75-1.75 1.75H17"/><path d="M7 14.2h10v6.1H7ZM16.5 11.5h.1"/>
        {children}
      </svg>
    );
  },
);
