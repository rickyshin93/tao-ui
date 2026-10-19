// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CalendarIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CalendarIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5.65 5.1h12.7q2.05 0 2.05 2.05v11.2q0 2.05-2.05 2.05H5.65q-2.05 0-2.05-2.05V7.15q0-2.05 2.05-2.05Z"/><path d="M8.1 3.1v4M15.9 3.1v4M3.8 10h16.4M8.2 14.5h.05m3.7 0H12m3.7 0h.05"/>
        {children}
      </svg>
    );
  },
);
