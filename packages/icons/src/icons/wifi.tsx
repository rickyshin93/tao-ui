// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WifiIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WifiIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.1 8.25a13.5 13.5 0 0 1 17.8 0M6.3 11.75a8.65 8.65 0 0 1 11.4 0M9.45 15.25a3.85 3.85 0 0 1 5.1 0"/><circle cx="12" cy="18.7" r=".9" fill="currentColor" stroke="none"/>
        {children}
      </svg>
    );
  },
);
