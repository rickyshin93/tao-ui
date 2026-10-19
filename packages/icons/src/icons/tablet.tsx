// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TabletIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TabletIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4.35" y="3.05" width="15.3" height="17.9" rx="1.9"/><circle cx="12" cy="17.8" r=".75" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
