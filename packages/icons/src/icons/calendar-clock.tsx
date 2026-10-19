// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CalendarClockIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CalendarClockIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9 21H5q-1.5 0-1.5-1.5v-13Q3.5 5 5 5h14q1.5 0 1.5 1.5V9M3.5 9.5H17M8 3v4M16 3v4"/><circle cx="16.5" cy="16.5" r="5"/><path d="M16.5 13.5v3l2 1"/>
        {children}
      </svg>
    );
  },
);
