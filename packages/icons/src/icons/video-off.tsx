// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const VideoOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function VideoOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M9.7 6.3h4.15q1.85 0 1.85 1.85v5.3M15.7 10l5-3v10l-2.4-1.45M3.2 8.3v7.55q0 1.85 1.85 1.85h8.6"/>
        {children}
      </svg>
    );
  },
);
