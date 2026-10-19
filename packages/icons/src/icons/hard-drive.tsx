// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HardDriveIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HardDriveIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.25 13.35 5.5 5.9q.4-1.45 1.9-1.45h9.2q1.5 0 1.9 1.45l2.25 7.45"/><rect x="3.1" y="12.35" width="17.8" height="7.2" rx="1.8"/><path d="M7 15.95h.05m3.45 0h.05"/>
        {children}
      </svg>
    );
  },
);
