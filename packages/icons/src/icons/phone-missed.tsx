// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PhoneMissedIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PhoneMissedIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7.5 3.4H5q-1.6 0-1.6 1.6c0 8.6 7 15.6 15.6 15.6q1.6 0 1.6-1.6v-2.5q0-.7-.7-.9l-3.3-1q-.6-.2-1 .25L14 16.5a13 13 0 0 1-6.5-6.5l1.65-1.6q.45-.4.25-1l-1-3.3q-.2-.7-.9-.7Z"/><path d="m12.7 4.3 3.8 4.2 4.2-4.2M17.2 4.3h3.5v3.5"/>
        {children}
      </svg>
    );
  },
);
