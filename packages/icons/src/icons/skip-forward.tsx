// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SkipForwardIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SkipForwardIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19 5v14M5.4 5.35q0-.95.8-.4l8.9 6.4q.9.65 0 1.3l-8.9 6.4q-.8.55-.8-.4Z"/>
        {children}
      </svg>
    );
  },
);
