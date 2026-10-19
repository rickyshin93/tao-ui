// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BatteryLowIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BatteryLowIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.1" y="7.05" width="15.7" height="9.9" rx="1.8"/><path d="M21.1 10.35v3.3"/><path d="M6.65 10.35v3.3"/>
        {children}
      </svg>
    );
  },
);
